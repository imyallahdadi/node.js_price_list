const brand = require('./brands.model')
const product = require('./products.model')

brand.hasMany(product,{
    foreignKey: 'brand_id',
    as: 'products'
})

product.belongsTo(brand,{
    foreignKey: 'brand_id',
    as: 'brand'
})

module.exports = { brand, product }