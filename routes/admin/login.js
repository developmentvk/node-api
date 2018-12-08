const express = require('express');
const router = express.Router();

router.get('/login', async (req, res) => {
    res.render('admin/login',{ layout: "admin/include/layout" });
});

module.exports = router; 
