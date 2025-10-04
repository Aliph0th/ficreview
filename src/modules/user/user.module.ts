import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from './models/User.model';
import { StorageModule } from '../storage/storage.module';

@Module({
   imports: [SequelizeModule.forFeature([User]), StorageModule],
   controllers: [UserController],
   providers: [UserService],
   exports: [UserService]
})
export class UserModule {}
