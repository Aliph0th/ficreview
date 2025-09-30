import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from './models/User.model';

@Module({
   imports: [SequelizeModule.forFeature([User])],
   controllers: [UserController],
   providers: [UserService],
   exports: [UserService]
})
export class UserModule {}
