const auth = require('../middleware/auth');
const {successMessage, errorMessage} = require('../helpers/SocketHelper');
const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
    res.render('site/index');
});

module.exports = router; 
