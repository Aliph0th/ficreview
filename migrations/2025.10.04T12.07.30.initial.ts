import { DataTypes, Sequelize } from 'sequelize';
import type { Migration } from '../src/umzug';

export const up: Migration = async ({ context }) => {
   const qi = context.getQueryInterface();

   await qi.createTable('Users', {
      id: {
         type: DataTypes.INTEGER,
         allowNull: false,
         autoIncrement: true,
         primaryKey: true
      },
      email: {
         type: DataTypes.STRING,
         allowNull: false,
         unique: true
      },
      username: {
         type: DataTypes.STRING,
         allowNull: false
      },
      password: {
         type: DataTypes.STRING,
         allowNull: false
      },
      role: {
         type: DataTypes.ENUM('ADMIN', 'USER'),
         allowNull: false,
         defaultValue: 'USER'
      },
      is_email_verified: {
         type: DataTypes.BOOLEAN,
         allowNull: false,
         defaultValue: false
      },
      avatar_path: {
         type: DataTypes.STRING,
         allowNull: true
      },
      createdAt: {
         type: DataTypes.DATE,
         allowNull: false,
         defaultValue: Sequelize.fn('NOW')
      },
      updatedAt: {
         type: DataTypes.DATE,
         allowNull: false,
         defaultValue: Sequelize.fn('NOW')
      }
   });

   await qi.createTable('Fanfics', {
      id: {
         type: DataTypes.INTEGER,
         allowNull: false,
         autoIncrement: true,
         primaryKey: true
      },
      title: {
         type: DataTypes.STRING,
         allowNull: false
      },
      description: {
         type: DataTypes.TEXT,
         allowNull: true
      },
      likes: {
         type: DataTypes.INTEGER,
         allowNull: false,
         defaultValue: 0
      },
      fandom: {
         type: DataTypes.STRING,
         allowNull: true
      },
      pairings: {
         type: DataTypes.JSONB,
         allowNull: false,
         defaultValue: []
      },
      tags: {
         type: DataTypes.JSONB,
         allowNull: false,
         defaultValue: []
      },
      author_id: {
         type: DataTypes.INTEGER,
         allowNull: false,
         references: { model: 'Users', key: 'id' },
         onUpdate: 'CASCADE',
         onDelete: 'CASCADE'
      },
      cover_path: {
         type: DataTypes.STRING,
         allowNull: true
      },
      createdAt: {
         type: DataTypes.DATE,
         allowNull: false,
         defaultValue: Sequelize.fn('NOW')
      },
      updatedAt: {
         type: DataTypes.DATE,
         allowNull: false,
         defaultValue: Sequelize.fn('NOW')
      }
   });

   await qi.createTable('Chapters', {
      id: {
         type: DataTypes.INTEGER,
         allowNull: false,
         autoIncrement: true,
         primaryKey: true
      },
      title: {
         type: DataTypes.STRING,
         allowNull: false
      },
      content_path: {
         type: DataTypes.STRING,
         allowNull: false
      },
      fanfic_id: {
         type: DataTypes.INTEGER,
         allowNull: false,
         references: { model: 'Fanfics', key: 'id' },
         onUpdate: 'CASCADE',
         onDelete: 'CASCADE'
      },
      createdAt: {
         type: DataTypes.DATE,
         allowNull: false,
         defaultValue: Sequelize.fn('NOW')
      },
      updatedAt: {
         type: DataTypes.DATE,
         allowNull: false,
         defaultValue: Sequelize.fn('NOW')
      }
   });

   await qi.createTable('Comments', {
      id: {
         type: DataTypes.INTEGER,
         allowNull: false,
         autoIncrement: true,
         primaryKey: true
      },
      content_path: {
         type: DataTypes.STRING,
         allowNull: false
      },
      author_id: {
         type: DataTypes.INTEGER,
         allowNull: false,
         references: { model: 'Users', key: 'id' },
         onUpdate: 'CASCADE',
         onDelete: 'CASCADE'
      },
      commentable_id: {
         type: DataTypes.INTEGER,
         allowNull: false
      },
      commentable_type: {
         type: DataTypes.ENUM('FANFIC', 'CHAPTER'),
         allowNull: false
      },
      createdAt: {
         type: DataTypes.DATE,
         allowNull: false,
         defaultValue: Sequelize.fn('NOW')
      },
      updatedAt: {
         type: DataTypes.DATE,
         allowNull: false,
         defaultValue: Sequelize.fn('NOW')
      }
   });

   await qi.addIndex('Comments', ['commentable_type', 'commentable_id']);
};

export const down: Migration = async ({ context }) => {
   const qi = context.getQueryInterface();

   await qi.dropTable('Comments');
   await qi.dropTable('Chapters');
   await qi.dropTable('Fanfics');
   await qi.dropTable('Users');

   await qi.sequelize.query(
      'DO $$ BEGIN IF EXISTS (SELECT 1 FROM pg_type WHERE typname = \'enum_Users_role\') THEN DROP TYPE "enum_Users_role"; END IF; END $$;'
   );
   await qi.sequelize.query(
      'DO $$ BEGIN IF EXISTS (SELECT 1 FROM pg_type WHERE typname = \'enum_Comments_commentable_type\') THEN DROP TYPE "enum_Comments_commentable_type"; END IF; END $$;'
   );

   await qi.removeIndex('Comments', ['commentable_type', 'commentable_id']);
};
