const express = require('express')
const router = express.Router()
const { brand, product } = require('../models/associations')

router.get('/', async (req, res) => {
    const q = req.query.q
    const brands = await brand.findAll()
    res.render('brands', { brands, q })
})

router.get('/products/:brand_id', async (req, res)=> {
    const { brand_id } = req.params;
    const selectedbrand = await brand.findByPk(brand_id, { include: { model: product, as: 'products' } }) 
    if(!selectedbrand){
        return res.redirect('/?q=' + encodeURIComponent('برند پیدا نشد!'))
    }
    res.render('products', {brand: selectedbrand, products: selectedbrand.products  })


})

router.get("/api/products/:brand_id", async (req, res) => {
    try{
        const { brand_id } = req.params;
        const selectedbrand = await brand.findByPk(brand_id, { include: { model: product, as: 'products' } }) 
        if(!selectedbrand){
            return res.status(404).json({error: 'برند پیدا نشد'});
        }
        res.json(selectedbrand.products);
    }catch (err){
        console.log(err);
        res.status(500).json({error: 'خطا در دریافت محصولات '});
    }
})

module.exports = router