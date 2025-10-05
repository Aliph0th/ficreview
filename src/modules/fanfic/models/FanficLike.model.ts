import { type CreationOptional, InferAttributes, InferCreationAttributes } from 'sequelize';
import {
   AllowNull,
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

@Table({ timestamps: false })
export class FanficLike extends Model<InferAttributes<FanficLike>, InferCreationAttributes<FanficLike>> {
   @PrimaryKey
   @AllowNull(false)
   @ForeignKey(() => Fanfic)
   @Column({ field: 'fanfic_id', type: DataType.INTEGER })
   declare fanficID: number;

   @PrimaryKey
   @AllowNull(false)
   @ForeignKey(() => User)
   @Column({ field: 'user_id', type: DataType.INTEGER })
   declare userID: number;

   @BelongsTo(() => Fanfic, { onDelete: 'CASCADE' })
   fanfic: CreationOptional<Fanfic>;

   @BelongsTo(() => User, { onDelete: 'CASCADE' })
   user: CreationOptional<User>;
}
