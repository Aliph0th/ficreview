import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/sequelize';
import { randomUUID } from 'crypto';
import sharp from 'sharp';
import { StorageService } from '../../storage/storage.service';
import { User } from '../../user/models/User.model';
import { CreateFanficDTO } from '../dto';
import { Fanfic } from '../models/Fanfic.model';

@Injectable()
export class FanficService {
   constructor(
      @InjectModel(Fanfic) private fanficModel: typeof Fanfic,
      private readonly storage: StorageService,
      private readonly configService: ConfigService
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

      return await this.getFanficByIDOrThrow(fanfic.id);
   }

   async getFanficByIDOrThrow(id: number) {
      const fanfic = await this.fanficModel.findByPk(id, {
         include: { model: User, attributes: ['id', 'username', 'role'] }
      });
      if (!fanfic) {
         throw new NotFoundException('Fanfic not found');
      }
      return fanfic;
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
      return await this.getFanficByIDOrThrow(id);
   }
}
