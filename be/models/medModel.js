// backend/models/medModel.js

import { Model, DataTypes } from 'sequelize';
import Sequ from '../db.js';

// Definition des Medications-Modells
class Med extends Model {}

Med.init({
    med_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },

    m_list_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'lists',
            key: 'list_id',
        }
    },

    med_name: {
        type: DataTypes.STRING,
        allowNull: false
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
    modelName: 'Med',
    tableName: 'meds', 
    timestamps: false, // Beibehaltung, wenn Sie keine `createdAt` und `updatedAt` Felder wünschen
    underscored: true
});

export default Med;
