const { DataTypes } = require('sequelize');
const sequelize = require('../database/sequelize-connect');

const brands = sequelize.define(
    'brands',
    {
        brand_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            allowNull: false,
            unique: true,
            require: true,
            primaryKey: true

        },
        brand_name: {
            type: DataTypes.STRING,
            allowNull: false,
            require: true,
            unique: true
        },
        logo: {
            type: DataTypes.STRING,
            allowNull: true,
        }

    },
    {
        timestamps: false
    }
)

module.exports = brands