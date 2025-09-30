import { type CreationOptional, InferAttributes, InferCreationAttributes } from 'sequelize';
import {
   AllowNull,
   AutoIncrement,
   BelongsTo,
   Column,
   DataType,
   Default,
   ForeignKey,
   HasMany,
   Length,
   Model,
   PrimaryKey,
   Table
} from 'sequelize-typescript';

import { User } from '../../user/models/User.model';
import { Chapter } from './Chapter.model';

@Table
export class Fanfic extends Model<InferAttributes<Fanfic>, InferCreationAttributes<Fanfic>> {
   @PrimaryKey
   @AutoIncrement
   @Column(DataType.INTEGER)
   declare id: CreationOptional<number>;

   @AllowNull(false)
   @Column(DataType.STRING)
   declare title: string;

   @Length({ max: 5000 })
   @Column(DataType.TEXT)
   declare description: string | null;

   @AllowNull(false)
   @Default(0)
   @Column(DataType.INTEGER.UNSIGNED)
   declare likes: number;

   @Column(DataType.STRING)
   declare fandom: string;

   @Default('{}')
   @Column(DataType.JSONB)
   declare pairings: object;

   @Default('[]')
   @Column(DataType.JSONB)
   declare tags: object;

   @AllowNull(false)
   @ForeignKey(() => User)
   @Column({ field: 'author_id', type: DataType.INTEGER })
   declare authorID: number;

   @Column({ field: 'cover_path', type: DataType.STRING })
   declare coverPath: string | null;

   @BelongsTo(() => User, { onDelete: 'CASCADE' })
   user: User;

   @HasMany(() => Chapter)
   chapters: Chapter[];
}
