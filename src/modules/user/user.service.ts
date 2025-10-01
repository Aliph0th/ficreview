import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from './models/User.model';

@Injectable()
export class UserService {
   constructor(@InjectModel(User) private userModel: typeof User) {}

   async create({ email, username, password }: Pick<User, 'email' | 'username' | 'password'>) {
      return await this.userModel.create({ email, username, password });
   }

   async findByEmail(email: string) {
      return await this.userModel.findOne({ where: { email } });
   }
   async findByID(id: number) {
      return await this.userModel.findByPk(id);
   }

   async setVerifiedEmail(id: number) {
      await this.userModel.update({ isEmailVerified: true }, { where: { id } });
   }
}
