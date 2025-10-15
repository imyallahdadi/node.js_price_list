const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
const { brand, product } = require('../models/associations')
const users = require('../models/admin_users.model')



router.get('/', async (req, res) => {
    const q = req.query.q
    const secret = 'your_secret_key'
    if(req.cookies.token){
        try{
            const { token } = req.cookies
            jwt.verify(token, secret)

            const brands = await brand.findAll()
            res.render('admin', { brands: brands || [] })

        }catch{
            res.clearCookie('token')
            res.redirect('/admin?q=invalid or expired token :( ')
        }

    }else {
        res.render('admin_login', { q })
    }
    
})

router.post('/', async (req, res) => {
    const admin = req.body
    const secret = 'your_secret_key'

    const user = await users.findOne({
        where: 
        {
            username: admin.username,
        }
    })
    if(user){
        if(user.password == admin.password){
            const payload = {
                "username": user.username,
                "email": user.email
            }
            const token = jwt.sign(payload, secret, { expiresIn: "5h" });
            res.cookie('token', token, {
                maxAge: 5 * 60 * 60 * 1000,
                path: "/"
            })
            res.redirect('/admin')
        }else{
            res.redirect('/admin?q=password is incorect')
        }

    }else {
        res.redirect('/admin?q=user not found')
    }



})

module.exports = router