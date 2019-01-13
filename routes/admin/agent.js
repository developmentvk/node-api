const express = require('express');
const adminSession = require('../../middleware/adminSession');
const rbac = require('../../middleware/rbac');
const i18n = require("i18n");
const { Agent, validate, validateUpdate, validateUpdatePassword } = require('../../models/agents');
const { AgentLoginLogs } = require('../../models/agentLoginLogs');
const { successMessage, errorMessage } = require('../../helpers/MyHelper');
const { Countries } = require('../../models/countries');
const { Sessions } = require('../../models/sessions');
const _ = require('lodash');
const bcrypt = require('bcrypt');
const router = express.Router();

router.post('/agent/listings/:company_id', [adminSession], async (req, res) => {
    Agent.dataTables({
        limit: req.body.length,
        skip: req.body.start,
        order: req.body.order,
        columns: req.body.columns,
        search: {
            value: req.body.search.value,
            fields: ['name', 'en_name', 'email', 'dial_code', 'mobile']
        },
        find: {
            company_id: req.params.company_id,
            isArchive: false,
            isDeleted: false
        },
    }).then(function (table) {
        res.json({
            data: table.data,
            recordsFiltered: table.total,
            recordsTotal: table.total
        });
    });
});


router.get('/agent/create/:company_id', [adminSession, rbac], async (req, res) => {
    let error = req.flash('error');
    let success = req.flash('success');
    const countries = await Countries.find({
        isArchive: false,
        isDeleted: false
    });

    res.render('admin/agent/create', {
        layout: "admin/include/layout",
        title: i18n.__('create_agent'),
        countries: countries,
        error: error,
        success: success
    });
});

router.post('/agent/create/:company_id', [adminSession, rbac], async (req, res) => {
    const { error } = validate(req.body);
    if (error) {
        req.flash('error', error.details[0].message);
        return res.redirect(`/admin/company/agent/create/${req.params.company_id}`);
    }
    let agent = await Agent.findOne({
        company_id: req.params.company_id,
        email: req.body.email,
        isArchive: false,
        isDeleted: false
    });
    if (agent) {
        req.flash('error', [i18n.__('company_agent_account_already_registered')]);
        return res.redirect(`/admin/company/agent/create/${req.params.company_id}`);
    }

    let fields = ['company_id', 'name', 'en_name', 'dial_code', 'mobile', 'email', 'password', 'image', 'status'];
    if (req.body.image) {
        fields.push('image');
    }
    agent = new Agent(_.pick(req.body, fields));
    const salt = await bcrypt.genSalt(10);
    agent.password = await bcrypt.hash(agent.password, salt);
    await agent.save();

    req.flash('success', [i18n.__('company_agent_saved_successfully')]);
    return res.redirect(`/admin/company/agent/create/${req.params.company_id}`);
});

router.get('/agent/update/:id', [adminSession, rbac], async (req, res) => {
    let error = req.flash('error');
    let success = req.flash('success');
    const agent = await Agent.findOne({
        _id: req.params.id
    });
    if (!agent) {
        req.flash('error', [i18n.__('record_not_found')]);
        return res.redirect('/admin/company');
    }
    const countries = await Countries.find({
        isArchive: false,
        isDeleted: false
    });
    res.render('admin/agent/update', {
        layout: "admin/include/layout",
        title: i18n.__('update_agent'),
        error: error,
        success: success,
        data: agent,
        countries: countries
    });
});

router.post('/agent/update/:id', [adminSession, rbac], async (req, res) => {
    const { error } = validateUpdate(req.body);
    if (error) {
        req.flash('error', error.details[0].message);
        res.redirect(`/admin/company/agent/update/${req.params.id}`);
    }

    let agent = await Agent.findOne({
        _id: { $ne: req.params.id },
        email: req.body.email,
        company_id: req.body.company_id,
        isArchive: false,
        isDeleted: false
    });
    if (agent) {
        req.flash('error', [i18n.__('company_agent_account_already_registered')]);
        res.redirect(`/admin/company/agent/update/${req.params.id}`);
    }
    let fields = {
        name: req.body.name,
        en_name: req.body.en_name,
        dial_code: req.body.dial_code,
        mobile: req.body.mobile,
        email: req.body.email,
        status: req.body.status
    };
    if (req.body.image) {
        fields.image = req.body.image;
    }
    await Agent.findByIdAndUpdate(req.params.id, fields, { new: true });

    req.flash('success', [i18n.__('company_agent_updated_successfully')]);
    return res.redirect(`/admin/company/agent/update/${req.params.id}`);
});

router.post('/agent/delete/:id', [adminSession, rbac], async (req, res) => {
    const agent = await Agent.findByIdAndUpdate(req.params.id, {isArchive : true}, { new: true });
    if (!agent) return errorMessage(res, 'no_record_found');
    return successMessage(res, 'success', 200, agent);
});

router.get('/agent/view/:id', [adminSession, rbac], async (req, res) => {
    let error = req.flash('error');
    let success = req.flash('success');
    const agent = await Agent.findOne({
        _id: req.params.id
    });
    if (!agent) {
        req.flash('error', [i18n.__('record_not_found')]);
        return res.redirect('/admin/company');
    }
    agent.decoded_status = i18n.__('account_status_array')[agent.status];

    const agentLoginLogs = await AgentLoginLogs.findOne({
        agent_id: agent._id,
        isActive: true
    });

    res.render('admin/agent/view', {
        layout: "admin/include/layout",
        title: i18n.__('view_details'),
        error: error,
        success: success,
        data: agent,
        agentLoginLogs: agentLoginLogs
    });
});


router.post('/agent/end-session/:id', [adminSession], async (req, res) => {
    let agentLoginLogsExists = await AgentLoginLogs.find({
        agent_id: req.params.id,
        isActive: true
    }).exec();
    if (agentLoginLogsExists.length > 0) {
        _.forEach(agentLoginLogsExists, async function (value) {
            await Sessions.deleteOne({ "session.agent.login_id": value._id });
            await AgentLoginLogs.findByIdAndUpdate(value._id, {
                logout_at: new Date(),
                isActive: false
            }, { new: true });

            req.app.io.emit("logoutAgentSessionEvent", {
                agent_id: value.agent_id,
                action: 'terminated'
            });
        })
    }

    return successMessage(res, 'success', 200);
});

router.post('/agent/access-log/listings/:agent_id', [adminSession], async (req, res) => {
    AgentLoginLogs.dataTables({
        limit: req.body.length,
        skip: req.body.start,
        order: req.body.order,
        columns: req.body.columns,
        find: {
            agent_id: req.params.agent_id,
            isActive: false,
            isArchive: false,
            isDeleted: false
        },
        search: {
            value: req.body.search.value,
            fields: ['ip_address', 'browser', 'session_id']
        }
    }).then(function (table) {
        res.json({
            data: table.data,
            recordsFiltered: table.total,
            recordsTotal: table.total
        });
    });
});

router.post('/agent/access-log/delete/:id', [adminSession, rbac], async (req, res) => {
    const agentLoginLogs = await AgentLoginLogs.findByIdAndUpdate(req.params.id, {isArchive : true}, { new: true });
    if (!agentLoginLogs) return errorMessage(res, 'no_record_found');
    return successMessage(res, 'success', 200, agentLoginLogs);
});

router.get('/agent/change/password/:id', [adminSession, rbac], async (req, res) => {
    let error = req.flash('error');
    let success = req.flash('success');
    const agent = await Agent.findOne({
        _id: req.params.id
    });
    if (!agent) {
        req.flash('error', [i18n.__('record_not_found')]);
        return res.redirect('/admin/company');
    }

    res.render('admin/agent/update_password', {
        layout: "admin/include/layout",
        title: i18n.__('change_password'),
        error: error,
        success: success,
        data: agent
    });
});

router.post('/agent/change/password/:id', [adminSession, rbac], async (req, res) => {
    const { error } = validateUpdatePassword(req.body);
    if (error) {
        req.flash('error', error.details[0].message);
        return res.redirect(`/admin/company/agent/change/password/${req.params.id}`);
    }

    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash(req.body.password, salt);

    await Agent.findByIdAndUpdate(req.params.id, { password: password }, { new: true });

    req.flash('success', [i18n.__('account_password_updated_successfully')]);
    return res.redirect(`/admin/company/agent/change/password/${req.params.id}`);
});


module.exports = router; 
