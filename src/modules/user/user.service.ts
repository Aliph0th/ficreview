import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from './models/User.model';

@Injectable()
export class UserService {
   constructor(@InjectModel(User) private userModel: typeof User) {}

   async findByEmail(email: string) {
      return await this.userModel.findOne({ where: { email } });
   }
}
