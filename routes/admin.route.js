const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
const { brand, product } = require('../models/associations')
const users = require('../models/admin_users.model')
const crypto = require('crypto')
const fs = require('fs')
const multer = require('multer')
const path = require('path')


const brandUploadDir = "statics/images/b_img";
const productUploadDir = "statics/images/p_img";
fs.mkdirSync(brandUploadDir, { recursive: true });
fs.mkdirSync(productUploadDir, { recursive: true });



function makeHashedFilename(originalName, textToHash) {
    const ext = path.extname(originalName) || "";
    const hash = crypto.createHash("sha256").update(textToHash).digest("hex").slice(0, 16);
    return `${hash}${ext}`;
}

const brandStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, brandUploadDir),
  filename: (req, file, cb) => {
    const brandName = (req.body && req.body.brand_name) ? req.body.brand_name : "brand";
    const filename = makeHashedFilename(file.originalname, brandName);
    cb(null, filename);
  }
});
const uploadBrand = multer({ storage: brandStorage });

const productStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, productUploadDir),
  filename: (req, file, cb) => {
    const productName = (req.body && req.body.p_name) ? req.body.p_name : "product";
    const filename = makeHashedFilename(file.originalname, productName);
    cb(null, filename);
  }
});
const uploadProduct = multer({ storage: productStorage });



router.get('/', async (req, res) => {
    const q = req.query.q
    const secret = 'your_secret_key'
    if(req.cookies.token){
        try{
            const { token } = req.cookies
            jwt.verify(token, secret)

            const brands = await brand.findAll()
            const products = await product.findAll()
            res.render('admin', { brands: brands, products: products || [] })

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

router.post("/add-brand", uploadBrand.single("logo"), async (req, res) => {
  try {
    const brand_name = req.body.brand_name;
    const logoPath = req.file ? `/statics/images/b_img/${req.file.filename}` : null;

    const [existing] = await db.query("SELECT * FROM brands WHERE brand_name = ?", [brand_name]);
    if (existing.length > 0) {
      await db.query("UPDATE brands SET logo_path = ? WHERE brand_name = ?", [logoPath, brand_name]);
    } else {
      await db.query("INSERT INTO brands (brand_name, logo_path) VALUES (?, ?)", [brand_name, logoPath]);
    }

    res.redirect("/admin");
  } catch (err) {
    console.error(err);
    res.status(500).send("خطا در ثبت برند");
  }
});


router.post("/add-product", uploadProduct.single("p_logo"), async (req, res) => {
  try {
    const p_name = req.body.p_name;
    const b_id = req.body.b_id;
    const logoPath = req.file ? `/statics/images/p_img/${req.file.filename}` : null;

    const [existing] = await db.query("SELECT * FROM products WHERE product_name = ?", [p_name]);
    if (existing.length > 0) {
      await db.query("UPDATE products SET product_logo = ?, brand_id = ? WHERE product_name = ?", [logoPath, b_id, p_name]);
    } else {
      await db.query("INSERT INTO products (product_name, brand_id, product_logo) VALUES (?, ?, ?)", [p_name, b_id, logoPath]);
    }

    res.redirect("/admin");
  } catch (err) {
    console.error(err);
    res.status(500).send("خطا در ثبت محصول");
  }
});

module.exports = router