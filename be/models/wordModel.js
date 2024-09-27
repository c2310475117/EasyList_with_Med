// backend/models/wordModel.js

import { Model, DataTypes } from 'sequelize';
import Sequ from '../db.js';


class Word extends Model {}

Word.init({
  word_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  word_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  w_list_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'lists',
      key: 'list_id',
    },
  },
  completed: {
    type: DataTypes.BOOLEAN, 
    defaultValue: false
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  sequelize: Sequ,
  modelName: 'Word',
  tableName: 'words',
  timestamps: true,
  underscored: true,
});

export default Word;
