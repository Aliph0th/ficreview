import { type CreationOptional, InferAttributes, InferCreationAttributes } from 'sequelize';
import {
   AllowNull,
   AutoIncrement,
   BelongsTo,
   Column,
   DataType,
   HasMany,
   ForeignKey,
   Model,
   PrimaryKey,
   Table
} from 'sequelize-typescript';

import { Fanfic } from './Fanfic.model';
import { Comment } from './Comment.model';

@Table
export class Chapter extends Model<InferAttributes<Chapter>, InferCreationAttributes<Chapter>> {
   @PrimaryKey
   @AutoIncrement
   @Column(DataType.INTEGER)
   declare id: CreationOptional<number>;

   @Column(DataType.STRING)
   declare name: string;

   @AllowNull(false)
   @Column(DataType.INTEGER)
   declare number: number;

   @AllowNull(false)
   @Column({ field: 'content_path', type: DataType.STRING })
   declare contentPath: string;

   @AllowNull(false)
   @ForeignKey(() => Fanfic)
   @Column({ field: 'fanfic_id', type: DataType.INTEGER })
   declare fanficID: number;

   @BelongsTo(() => Fanfic, { onDelete: 'CASCADE' })
   fanfic: Fanfic;

   @HasMany(() => Comment, {
      foreignKey: 'commentableID',
      constraints: false,
      scope: { commentableType: 'chapter' }
   })
   comments: Comment[];
}
