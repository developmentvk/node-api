const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
    res.render("site/index", {"header" : true, "layout" : "site/include/layout"});
});

module.exports = router; 
