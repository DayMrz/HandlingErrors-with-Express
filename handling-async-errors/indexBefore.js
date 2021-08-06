const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');

const Product = require('./models/product');
const methodOverride = require('method-override');
const { truncate } = require('fs');

const AppError = require('./AppError');

const ObjectID = require('mongodb').ObjectID;

mongoose.connect('mongodb://localhost:27017/farmStand2', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
})
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    console.log('we are connected!')
});

app.use(express.static(path.join(__dirname, 'public')));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true }))
app.use(methodOverride('_method')) //used for override the method

//category 
const categories = ['fruit', 'vegetable', 'dairy'];
//

app.get('/', (req, res) => {
    // res.send("Holi :)")
    res.render('products/home')
})

//  app.get('/products', async (req, res) => { 
// const products = await Product.find({})
// console.log(products) 1step
// res.send('ALL PRODUCTS WILL BE HERE!') 1step
// res.render('products/index', { products })
// })  

function wrapAsync(fn) {
    return function (req, res, next) {
        fn(req, res, next).catch(error => next(error))
    }
}

app.get('/products', async (req, res, next) => {
    // finding by category!!
    try {
        const { category } = req.query;
        if (category) {
            const products = await Product.find({ category })
            res.render('products/index', { products, category })
        } else {
            const products = await Product.find({})
            res.render('products/index', { products, category: 'All' })
        }
    } catch (error) {
        next(error);
    }
})
//


app.get('/products/new', (req, res) => {
    // throw new AppError('NOT ALLOWED', 401) //This shows thar our AppError is working
    res.render('products/new', { categories })
})



app.post('/products', async (req, res, next) => {
    // console.log(req.body)
    try {
        const newProduct = new Product(req.body)
        await newProduct.save();
        // console.log(newProduct)
        // res.send('Making Your product')
        res.redirect(`/products/${newProduct._id}`)
    } catch (error) {
        next(error);
    }
})

app.get('/products/:id', async (req, res, next) => {
    const { id } = req.params;
    if (!ObjectID.isValid(id)) {
        return next(new AppError('Invalid Id', 400))
    }
    // console.log(product);
    // res.send('details page')
    const product = await Product.findById(id)
    if (!product) {
        return next(new AppError('Product Not Found', 404))
    }
    res.render('products/show', { product })
});

// edit
app.get('/products/:id/edit', async (req, res, next) => {
    const { id } = req.params;
    if (!ObjectID.isValid(id)) {
        return next(new AppError('Invalid Id, Can Not Edit', 400))
    }
    const product = await Product.findById(id);
    if (!product) {
        return next(new AppError('Product Not Found, Can Not Edit', 404))
    }
    res.render('products/edit', { product, categories })
})

app.put('/products/:id', wrapAsync(async (req, res, next) => {
    //     console.log(req.body);
    // res.send('PUT :)');

    const { id } = req.params;
    const product = await Product.findByIdAndUpdate(id, req.body, { runValidators: true, new: true, useFindAndModify: false });
    res.redirect(`/products/${product._id}`);

}))
// Delete
app.delete('/products/:id', async (req, res) => {
    // res.send("Yay, this is working!")
    const { id } = req.params;
    const deletedProduct = await Product.findByIdAndDelete(id);
    res.redirect('/products');
})

app.use((err, req, res, next) => {
    const { status = 500, message = 'Something Went Wrong' } = err;
    res.status(status).send(message);
})

app.listen(3000, () => {
    console.log('APP IS LISTENING ON PORT 3000')
})

