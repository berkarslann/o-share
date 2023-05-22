const path = require('path');

const express = require('express');
const isAuth = require('../middleware/is-auth');

const feedController = require('../controllers/feed');

const router = express.Router();

router.get('/feed', isAuth, feedController.getAddProduct);

router.get('/myfeeds', isAuth, feedController.getMyFeeds)

router.post('/feed',  isAuth,feedController.postAddProduct);

router.post('/delete-product', isAuth, feedController.deleteProduct)



module.exports = router;