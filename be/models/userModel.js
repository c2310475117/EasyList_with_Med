//!-- backend/models/userModel.js -->

import { Model, DataTypes } from 'sequelize';
import Sequ from '../db.js';

// Definition des User-Modells
class User extends Model {}

console.log('Initializing User model...');

User.init({
    user_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    
    user_name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },

    password_hash: {
        type: DataTypes.STRING,
        allowNull: false
    },

    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },

    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },

    updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }

}, {
    sequelize: Sequ,
    modelName: 'User',
    tableName: 'users', 
    timestamps: true,
    underscored: true
});

export default User;
