const express = require('express');
const adminSession = require('../../middleware/adminSession');
const { AdminLoginLogs } = require('../../models/adminLoginLogs');
const i18n = require("i18n");
const router = express.Router();

router.get('/dashboard', adminSession, async (req, res) => {
    let error = req.flash('error');
    let success = req.flash('success');

    res.render('admin/dashboard/index', {
        layout: "admin/include/layout",
        title: i18n.__('dashboard'),
        error: error,
        success: success
    });
});


router.get('/logout', adminSession, async (req, res) => {
    if (req.session.adminAuthenticated === true && req.cookies.session) {
        if(req.session.admin.login_id)
        {
            await AdminLoginLogs.findByIdAndUpdate(req.session.admin.login_id, { 
                logout_at: new Date(),
                isActive: false
            }, { new: true });
        }
        await req.session.destroy();
        await res.clearCookie('session');
        return res.redirect('/admin/login?logout=true');
    } else {
        return res.redirect('/admin/logout');
    }
});

module.exports = router; 
