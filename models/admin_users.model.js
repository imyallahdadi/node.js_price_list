const { DataTypes } = require('sequelize');
const sequelize = require('../database/sequelize-connect');

const users = sequelize.define(
    'users',
    {
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      require: true,
      set(value) {
        this.setDataValue('username', value ? value.toLowerCase() : '');
      }
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      require: true,
      set(value) {
        this.setDataValue('email', value ? value.toLowerCase() : '');
      }
    }
    }
)

module.exports = users