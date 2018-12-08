const auth = require('../middleware/auth');
const { successMessage, errorMessage } = require('../helpers/SocketHelper');
const express = require('express');
const router = express.Router();

router.get('/login', async (req, res) => {
    res.render('admin/login');
});

module.exports = router; 
