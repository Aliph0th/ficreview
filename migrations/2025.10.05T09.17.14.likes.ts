import { DataTypes } from 'sequelize';
import type { Migration } from '../src/umzug';

export const up: Migration = async ({ context }) => {
   const qi = context.getQueryInterface();
   await qi.createTable('FanficLikes', {
      fanfic_id: {
         type: DataTypes.INTEGER,
         allowNull: false,
         references: { model: 'Fanfics', key: 'id' },
         onUpdate: 'CASCADE',
         onDelete: 'CASCADE'
      },
      user_id: {
         type: DataTypes.INTEGER,
         allowNull: false,
         references: { model: 'Users', key: 'id' },
         onUpdate: 'CASCADE',
         onDelete: 'CASCADE'
      }
   });

   await qi.addConstraint('FanficLikes', {
      type: 'primary key',
      name: 'pk_fanfic_likes',
      fields: ['fanfic_id', 'user_id']
   });
};

export const down: Migration = async ({ context }) => {
   const qi = context.getQueryInterface();
   await qi.dropTable('FanficLikes');
};
