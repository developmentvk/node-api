const { Customer, validate } = require('../../models/customer');
const setLocale = require('../../middleware/setLocale');
const { successMessage, errorMessage } = require('../../helpers/SocketHelper');
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();

router.get('/', setLocale, async (req, res) => {
	const customers = await Customer.find().sort('name');
	return successMessage(res, 'success', 200, customers);
});

router.post('/', setLocale, async (req, res) => {
	const { error } = validate(req.body);
	if (error) return errorMessage(res, error.details[0], true);

	let customer = new Customer({
		name: req.body.name,
		isGold: req.body.isGold,
		phone: req.body.phone
	});
	customer = await customer.save();

	return successMessage(res, 'success', 201, customer);
});

router.put('/:id', setLocale, async (req, res) => {
	const { error } = validate(req.body);
	if (error) return errorMessage(res, error.details[0], true);

	const customer = await Customer.findByIdAndUpdate(req.params.id,
		{
			name: req.body.name,
			isGold: req.body.isGold,
			phone: req.body.phone
		}, { new: true });

	if (!customer) return errorMessage(res, 'no_customer_found');
	return successMessage(res, 'success', 200, customer);
});

router.delete('/:id', setLocale, async (req, res) => {
	const customer = await Customer.findByIdAndRemove(req.params.id);

	if (!customer) return errorMessage(res, 'no_customer_found');

	return successMessage(res, 'success', 200, customer);
});

router.get('/:id', setLocale, async (req, res) => {
	const customer = await Customer.findById(req.params.id);

	if (!customer) return errorMessage(res, 'no_customer_found');
	return successMessage(res, 'success', 200, customer);
});

module.exports = router; 