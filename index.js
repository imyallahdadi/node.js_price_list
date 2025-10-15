const express = require('express')
const sequelize = require('./database/sequelize-connect')
const cookieParser = require('cookie-parser')
const path = require('path')
const homeroute = require('./routes/home.route')
const adminroute = require('./routes/admin.route')

const app = express()
const port = 2020
app.use(express.json());
app.use(express.urlencoded({ extended: true}))
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'statics')))


app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

app.use('/', homeroute)
app.use('/admin', adminroute)









app.listen(port, async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    console.log('Connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
  console.log(`Example app listening on port ${port}`)
})

