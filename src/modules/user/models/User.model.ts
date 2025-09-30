import { type CreationOptional, InferAttributes, InferCreationAttributes } from 'sequelize';
import {
   AllowNull,
   AutoIncrement,
   Column,
   DataType,
   Default,
   HasMany,
   IsEmail,
   Length,
   Model,
   PrimaryKey,
   Table,
   Unique
} from 'sequelize-typescript';
import { Role } from '../../../common/constants';
import { Fanfic } from '../../fanfic/models/Fanfic.model';

@Table
export class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
   @PrimaryKey
   @AutoIncrement
   @Column(DataType.INTEGER)
   declare id: CreationOptional<number>;

   @Unique
   @AllowNull(false)
   @IsEmail
   @Column(DataType.STRING)
   declare email: string;

   @AllowNull(false)
   @Length({ min: 4, max: 25 })
   @Column(DataType.STRING)
   declare username: string;

   @AllowNull(false)
   @Column(DataType.STRING)
   declare password: string;

   @AllowNull(false)
   @Default(Role.USER)
   @Column(DataType.ENUM(...Object.values(Role)))
   declare role: Role;

   @Column({ field: 'avatar_path', type: DataType.STRING })
   declare avatarPath: string | null;

   @HasMany(() => Fanfic)
   fanfics: Fanfic[];
}
