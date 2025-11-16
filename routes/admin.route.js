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
            res.render('admin', { brands: brands, products: products, q: q || [] })

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
    const logoPath = req.file ? `/images/b_img/${req.file.filename}` : null;

    const existing = await brand.findOne( { where: { brand_name: brand_name } } );
    if (existing) {
      await existing.update( { logo: logoPath} );
    } else {
      await brand.create( { brand_name: brand_name,  logo: logoPath } );
    }

    res.redirect("/admin?q=changing successfully!");
  } catch (err) {
    console.error(err);
    res.status(500).send("خطا در ثبت برند");
  }
});


router.post("/add-product", uploadProduct.single("p_logo"), async (req, res) => {
  try {
    const p_name = req.body.p_name;
    const b_id = req.body.b_id;
    const price  = req.body.price;
    const logoPath = req.file ? `/images/p_img/${req.file.filename}` : null;

    const existing = await product.findOne( {
      where: {
        p_name: p_name,
        brand_id: b_id
      }
    });
    if (existing) {
      await existing.update( { p_logo: logoPath} );
    } else {
      await product.create( { p_name: p_name, brand_id: b_id, p_price: price, p_logo: logoPath} );
    }

    res.redirect("/admin?q=changing successfully!");
  } catch (err) {
    console.error(err);
    res.status(500).send("خطا در ثبت محصول");
  }
});

router.post("/edit-brand", uploadBrand.single("logo"), async (req, res) => {
  try {
    const { brand_id, brand_name } = req.body;

    // 1. گرفتن برند موجود
    const b = await brand.findOne({ where: { brand_id }});
    if (!b) return res.redirect("/admin?q=brand not found");

    let newLogoPath = b.logo; // پیش‌فرض: همون قبلی بماند

    // 2. اگر لوگوی جدید آپلود شده باشد → تولید هش جدید + حذف فایل قبلی
    if (req.file) {
      newLogoPath = `/images/b_img/${req.file.filename}`;

      // حذف فایل قدیمی اگر وجود داشته باشد:
      if (b.logo) {
        const oldPath = path.join("statics", b.logo.replace("/images", ""));
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
    }

    // 3. به‌روزرسانی برند
    await b.update({
      brand_name: brand_name,
      logo: newLogoPath
    });

    return res.redirect("/admin?q=brand updated successfully!");

  } catch (err) {
    console.error(err);
    res.redirect("/admin?q=error updating brand");
  }
});



module.exports = router