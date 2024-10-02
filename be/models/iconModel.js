// backend/models/iconModel.js

import { Model, DataTypes } from 'sequelize';
import Sequ from '../db.js';

class Icon extends Model {}

Icon.init({
  icon_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  icon_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  icon_svg: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  completed: {
    type: DataTypes.BOOLEAN, 
    defaultValue: false
  },
  
  i_list_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'lists',
      key: 'list_id',
    },
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
  modelName: 'Icon',
  tableName: 'icons',
  timestamps: true,
  underscored: true,
});

export default Icon;

