import { type CreationOptional, InferAttributes, InferCreationAttributes } from 'sequelize';
import {
   Column,
   Model,
   Table,
   PrimaryKey,
   AutoIncrement,
   DataType,
   Unique,
   NotNull,
   Default,
   IsEmail,
   Length
} from 'sequelize-typescript';
import { Role } from '../../../common/constants';

@Table
export class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
   @PrimaryKey
   @AutoIncrement
   @Column(DataType.INTEGER)
   declare id: CreationOptional<number>;

   @Unique
   @NotNull
   @IsEmail
   @Column(DataType.STRING)
   declare email: string;

   @NotNull
   @Length({ min: 4, max: 25 })
   @Column(DataType.STRING)
   declare username: string;

   @NotNull
   @Column(DataType.STRING)
   declare password: string;

   @NotNull
   @Default(Role.USER)
   @Column(DataType.ENUM(...Object.values(Role)))
   declare role: Role;

   @Column(DataType.STRING)
   declare avatarPath: string | null;
}
