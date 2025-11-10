const { DataTypes } = require('sequelize');
const sequelize = require('../database/sequelize-connect');
const brands = require('./brands.model');

const products = sequelize.define(
    'products',
    {
        p_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true
        },
        p_name: {
            type: DataTypes.STRING,
            allowNull: false,
            require: true
        },
        p_price: {
            type: DataTypes.BIGINT,
            allowNull: false,
            defaultValue: 0
        },
        p_logo: {
            type: DataTypes.STRING,
            allowNull: true
        },
        brand_id:
        {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: brands,
                key: 'brand_id'
            },
            onDelete: 'CASCADE'
        }
    },
    {
        timestamps: true
    }
)

module.exports = products;