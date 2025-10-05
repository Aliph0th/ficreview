import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/sequelize';
import { randomUUID } from 'crypto';
import sharp from 'sharp';
import { StorageService } from '../../storage/storage.service';
import { User } from '../../user/models/User.model';
import { CreateFanficDTO } from '../dto';
import { FanficDTO } from '../dto/Fanfic.dto';
import { Fanfic } from '../models/Fanfic.model';
import { GetFanficsDTO } from '../dto/GetFanfics.dto';
import { FindAndCountOptions, Order } from 'sequelize';
import { CacheService } from '../../../core/redis/cache.service';
import { CACHE_TTL, REDIS_KEYS } from '../../../common/constants';
import { FanficLike } from '../models/FanficLike.model';
import { instanceToPlain } from 'class-transformer';

@Injectable()
export class FanficService {
   constructor(
      @InjectModel(Fanfic) private readonly fanficModel: typeof Fanfic,
      @InjectModel(FanficLike) private readonly fanficLikeModel: typeof FanficLike,
      private readonly storage: StorageService,
      private readonly configService: ConfigService,
      private readonly cache: CacheService
   ) {}

   async isFanficExists(id: number) {
      const fanfic = await this.fanficModel.findByPk(id, { attributes: ['id'] });
      return !!fanfic;
   }

   async createFanfic(dto: CreateFanficDTO, userID: number, file?: Express.Multer.File) {
      let fileID: string | undefined;
      if (file) {
         fileID = randomUUID();
         const processedBuffer = await sharp(file.buffer).webp({ effort: 3 }).toBuffer();
         await this.storage.put(
            processedBuffer,
            {
               file: fileID,
               folder: this.configService.getOrThrow<string>('S3_COVERS_FOLDER'),
               ext: 'webp'
            },
            'public-read'
         );
      }

      const fanfic = await this.fanficModel.create({
         title: dto.title,
         description: dto.description,
         fandom: dto.fandom,
         coverPath: fileID,
         pairings: dto.pairings,
         tags: dto.tags,
         authorID: userID
      });
      await this.cache.incrVersion(REDIS_KEYS.VER.fanfics());
      return await this.getFanficByIDOrThrow(fanfic.id);
   }

   async getFanficByIDOrThrow(id: number) {
      const ver = await this.cache.getVersion(REDIS_KEYS.VER.fanfic(id));
      const key = REDIS_KEYS.CACHE.fanfic(id, ver);
      const cached = await this.cache.getJson<Record<string, unknown>>(key);
      if (cached) {
         return new FanficDTO(cached);
      }
      const fanfic = await this.fanficModel.findByPk(id, {
         include: { model: User, attributes: ['id', 'username', 'role'] }
      });
      if (!fanfic) {
         throw new NotFoundException('Fanfic not found');
      }
      const dto = new FanficDTO(fanfic.get({ plain: true }));
      await this.cache.setJson(key, instanceToPlain(dto), CACHE_TTL.fanfic);
      return dto;
   }

   async likeFanfic(id: number, userID: number): Promise<{ liked: boolean; likes: number }> {
      const fanfic = await this.fanficModel.findByPk(id);
      if (!fanfic) {
         throw new NotFoundException('Fanfic not found');
      }
      await this.fanficLikeModel.create({ fanficID: id, userID });
      fanfic.likes += 1;
      await fanfic.save();
      await this.cache.incrVersion(REDIS_KEYS.VER.fanfic(id));
      return { liked: true, likes: fanfic.likes };
   }

   async unlikeFanfic(id: number, userID: number): Promise<{ liked: boolean; likes: number }> {
      const fanfic = await this.fanficModel.findByPk(id);
      if (!fanfic) {
         throw new NotFoundException('Fanfic not found');
      }

      const removed = await this.fanficLikeModel.destroy({ where: { fanficID: id, userID } });
      fanfic.likes = Math.max(0, fanfic.likes - removed);
      await fanfic.save();
      await this.cache.incrVersion(REDIS_KEYS.VER.fanfic(id));
      return { liked: false, likes: fanfic.likes };
   }

   async toggleLike(fanficID: number, userID: number) {
      const exists = await this.fanficLikeModel.findOne({ where: { fanficID, userID } });
      let result: { liked: boolean; likes: number };
      if (exists) {
         result = await this.unlikeFanfic(fanficID, userID);
      } else {
         result = await this.likeFanfic(fanficID, userID);
      }
      return { ...result, fanficID };
   }

   async getFanfics({ page, limit, sort }: GetFanficsDTO) {
      const offset = (page - 1) * limit;
      const order: Order = [['createdAt', 'DESC']];
      if (sort === 'popular') {
         order.unshift(['likes', 'DESC']);
      }
      const options: FindAndCountOptions<Fanfic> = {
         include: { model: User, attributes: ['id', 'username', 'role'] },
         order,
         offset,
         limit
      };
      const ver = await this.cache.getVersion(REDIS_KEYS.VER.fanfics());
      const key = REDIS_KEYS.CACHE.fanficsList(page, limit, sort, ver);
      return await this.cache.getOrSetJson(key, CACHE_TTL.fanficsList, async () => {
         const { count, rows } = await this.fanficModel.findAndCountAll(options);
         const totalPages = Math.max(1, Math.ceil(count / limit));
         return {
            data: rows.map(f => {
               const dto = new FanficDTO(f.get({ plain: true }));
               return instanceToPlain(dto);
            }),
            pagination: {
               currentPage: page,
               totalPages,
               totalItems: count,
               itemsPerPage: limit,
               hasNextPage: page < totalPages,
               hasPrevPage: page > 1
            }
         };
      });
   }

   async deleteFanfic(id: number, userID: number) {
      const fanfic = await this.fanficModel.findByPk(id);
      if (!fanfic) throw new NotFoundException('Fanfic not found');

      if (fanfic.authorID !== userID) {
         throw new ForbiddenException('You do not have permission to delete this fanfic');
      }

      if (fanfic.coverPath) {
         await this.storage.delete({
            file: fanfic.coverPath,
            folder: this.configService.getOrThrow<string>('S3_COVERS_FOLDER'),
            ext: 'webp'
         });
      }

      await fanfic.destroy();
      await this.cache.incrVersion(REDIS_KEYS.VER.fanfics());
      return id;
   }

   async updateCover(id: number, userID: number, file: Express.Multer.File) {
      const fanfic = await this.fanficModel.findByPk(id);
      if (!fanfic) throw new NotFoundException('Fanfic not found');
      if (fanfic.authorID !== userID) {
         throw new ForbiddenException('You do not have permission to update this fanfic');
      }

      if (fanfic.coverPath) {
         await this.storage.delete({
            file: fanfic.coverPath,
            folder: this.configService.getOrThrow<string>('S3_COVERS_FOLDER'),
            ext: 'webp'
         });
      }

      const fileID = randomUUID();
      const processedBuffer = await sharp(file.buffer).webp({ effort: 3 }).toBuffer();
      await this.storage.put(
         processedBuffer,
         {
            file: fileID,
            folder: this.configService.getOrThrow<string>('S3_COVERS_FOLDER'),
            ext: 'webp'
         },
         'public-read'
      );

      fanfic.coverPath = fileID;
      await fanfic.save();
      await this.cache.incrVersion(REDIS_KEYS.VER.fanfic(id), REDIS_KEYS.VER.fanfics());
      return await this.getFanficByIDOrThrow(id);
   }
}
