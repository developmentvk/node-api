const express = require('express');
const companySession = require('../../middleware/companySession');
const { CompanyLoginLogs } = require('../../models/companyLoginLogs');
const i18n = require("i18n");
const router = express.Router();

router.get('/dashboard', [companySession], async (req, res) => {
    let error = req.flash('error');
    let success = req.flash('success');
    res.render('company/dashboard/index', {
        layout: "company/include/layout",
        title: i18n.__('dashboard'),
        error: error,
        success: success
    });
});


router.get('/logout', [companySession], async (req, res) => {
    if (req.session.companyAuthenticated === true && req.cookies.session) {
        if (req.session.company.login_id) {
            await CompanyLoginLogs.findByIdAndUpdate(req.session.company.login_id, {
                logout_at: new Date(),
                isActive: false
            }, { new: true });
        }

        await req.session.destroy();
        await res.clearCookie('session');
        return res.redirect('/company/login?logout=true');
    } else {
        return res.redirect('/company/logout');
    }
});

module.exports = router; 
