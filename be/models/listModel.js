//!-- backend/models/listModel.js -->

import { Model, DataTypes } from 'sequelize';
import Sequ from '../db.js';
import User from './userModel.js';

class List extends Model {}

// Definition des Listen-Modells
List.init({
    list_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },

    list_name: {
        type: DataTypes.STRING,
        allowNull: false
    },

    l_user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: 'user_id' // korrekte Referenz zum Primärschlüssel des Usermodells
        }
    },

    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },

}, {
    sequelize: Sequ,
    modelName: 'List',
    tableName: 'lists',
    timestamps: true, // aktiviert die integrierten Felder createdAt und updatedAt
    underscored: true
});

export default List;
