import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from './models/User.model';
import { randomUUID } from 'crypto';
import sharp from 'sharp';
import { AVATAR_SIZE } from '../../common/constants';
import { StorageService } from '../storage/storage.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UserService {
   constructor(
      @InjectModel(User) private userModel: typeof User,
      private readonly storage: StorageService,
      private readonly configService: ConfigService
   ) {}

   async create({ email, username, password }: Pick<User, 'email' | 'username' | 'password'>) {
      return await this.userModel.create({ email, username, password });
   }

   async findByEmail(email: string) {
      return await this.userModel.findOne({ where: { email } });
   }
   async findByID(id: number) {
      return await this.userModel.findByPk(id);
   }
   async findByIDOrThrow(id: number) {
      const user = await this.userModel.findByPk(id);
      if (!user) {
         throw new NotFoundException('User not found');
      }
      return user;
   }

   async setVerifiedEmail(id: number) {
      await this.userModel.update({ isEmailVerified: true }, { where: { id } });
   }

   async changeAvatar(file: Buffer, userID: number) {
      const user = await this.findByIDOrThrow(userID);
      const folder = this.configService.getOrThrow<string>('S3_AVATARS_FOLDER');

      if (user.avatarPath) {
         await this.storage.delete({
            file: user.avatarPath,
            folder,
            ext: 'webp'
         });
      }

      const fileID = randomUUID();
      const processedBuffer = await sharp(file)
         .resize(AVATAR_SIZE, AVATAR_SIZE)
         .webp({ effort: 3 })
         .toBuffer();

      await this.storage.put(
         processedBuffer,
         {
            file: fileID,
            folder,
            ext: 'webp'
         },
         'public-read'
      );

      await this.userModel.update({ avatarPath: fileID }, { where: { id: userID } });

      return {
         url: new URL(`${folder}/${fileID}.webp`, this.configService.getOrThrow('S3_CDN')).toString()
      };
   }

   async changeUsername(userID: number, username: string) {
      const user = await this.userModel.findByPk(userID);
      if (!user) {
         throw new NotFoundException('User not found');
      }
      user.username = username;
      await user.save();
      return user;
   }
}
