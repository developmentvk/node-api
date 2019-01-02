const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
    res.render("site/index", {"header" : true, "layout" : "site/include/layout"});
});

router.get('/m', async (req, res) => {
    res.render("site/maintenance", {"header" : true, "layout" : "site/include/maintenanceLayout"});
});

module.exports = router; 
