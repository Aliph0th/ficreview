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
import { Comment } from './Comment.model';

@Table
export class Fanfic extends Model<InferAttributes<Fanfic>, InferCreationAttributes<Fanfic>> {
   @PrimaryKey
   @AutoIncrement
   @Column(DataType.INTEGER)
   declare id: CreationOptional<number>;

   @AllowNull(false)
   @Column(DataType.STRING)
   declare title: string;

   @Length({ max: 3000 })
   @Column(DataType.TEXT)
   declare description: CreationOptional<string | null>;

   @AllowNull(false)
   @Default(0)
   @Column(DataType.INTEGER)
   declare likes: CreationOptional<number>;

   @Column(DataType.STRING)
   declare fandom: CreationOptional<string | null>;

   @Default('[]')
   @Column(DataType.JSONB)
   declare pairings: CreationOptional<string[]>;

   @Default('[]')
   @Column(DataType.JSONB)
   declare tags: CreationOptional<string[]>;

   @AllowNull(false)
   @ForeignKey(() => User)
   @Column({ field: 'author_id', type: DataType.INTEGER })
   declare authorID: number;

   @Column({ field: 'cover_path', type: DataType.STRING })
   declare coverPath: CreationOptional<string | null>;

   @BelongsTo(() => User, { onDelete: 'CASCADE' })
   author: CreationOptional<User>;

   @HasMany(() => Chapter)
   chapters: CreationOptional<Chapter[]>;

   @HasMany(() => Comment, {
      foreignKey: 'commentableID',
      constraints: false,
      scope: { commentableType: 'fanfic' }
   })
   comments: CreationOptional<Comment[]>;
}
