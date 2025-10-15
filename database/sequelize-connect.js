const { Sequelize } = require('sequelize')

const sequelize = new Sequelize('price_list','imannode','1234',{
    host: 'localhost',
    dialect: 'mysql'

});

module.exports = sequelize;