const utilities = require(".");
const { body, validationResult } = require("express-validator");
const accountModel = require("../models/account-model");

function validateClassification(req, res, next) {
    const { classification_name } = req.body;
    const regex = /^[A-Za-z0-9]+$/; // Regex for alphanumeric characters only

    if (!regex.test(classification_name)) {
        // If validation fails, send an error message or redirect
        return res.status(400).send('Classification name must not contain spaces or special characters.');
    }
    console.log('Validation middleware with body:', req.body);
    // If validation passes, move to the next middleware/controller
    next();
}

module.exports = { validateClassification }