import { type CreationOptional, InferAttributes, InferCreationAttributes } from 'sequelize';
import {
   AllowNull,
   AutoIncrement,
   BelongsTo,
   Column,
   DataType,
   ForeignKey,
   Model,
   PrimaryKey,
   Table
} from 'sequelize-typescript';

import { User } from '../../user/models/User.model';
import { Fanfic } from './Fanfic.model';
import { Chapter } from './Chapter.model';
import { CommentableType } from '../../../common/constants';

@Table
export class Comment extends Model<InferAttributes<Comment>, InferCreationAttributes<Comment>> {
   @PrimaryKey
   @AutoIncrement
   @Column(DataType.INTEGER)
   declare id: CreationOptional<number>;

   @AllowNull(false)
   @Column({ field: 'content_path', type: DataType.STRING })
   declare contentPath: string;

   @AllowNull(false)
   @ForeignKey(() => User)
   @Column({ field: 'author_id', type: DataType.INTEGER })
   declare authorID: number;

   @AllowNull(false)
   @Column({ field: 'commentable_id', type: DataType.INTEGER })
   declare commentableID: number;

   @AllowNull(false)
   @Column({ field: 'commentable_type', type: DataType.ENUM(...Object.values(CommentableType)) })
   declare commentableType: CommentableType;

   @BelongsTo(() => User, { onDelete: 'CASCADE' })
   author: User;

   @BelongsTo(() => Fanfic, { foreignKey: 'commentableID', constraints: false, onDelete: 'CASCADE' })
   fanfic: Fanfic;

   @BelongsTo(() => Chapter, { foreignKey: 'commentableID', constraints: false, onDelete: 'CASCADE' })
   chapter: Chapter;
}
