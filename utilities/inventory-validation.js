const { body, validationResult } = require('express-validator');
const utilities = require(".");
const validate = {};
const invModel = require("../models/inventoryModel");

validate.classificationNameRules = () => {
    console.log("Started first check");
    return [
        // classification_name is required and must be alphanumeric
        body('classification_name')
            .trim()
            .isLength({ min: 1 })
            .withMessage('Please provide a classification name.')
            .isAlphanumeric()
            .withMessage('Classification name must be alphanumeric.')
    ];
};

validate.checkClassAdd = async (req, res, next) => {
    console.log("Started second check");
    const errors = validationResult(req);

    console.log("Validation errors:", errors.array()); // Log validation errors

    if (!errors.isEmpty()) {
        let nav = await utilities.getNav();
        res.render('inventory/add-classification', {
            messages: errors.array(),
            title: 'Classification Additions',
            nav,
            classification_name: req.body.classification_name
        });
    } else {
        console.log("No validation errors, proceeding to next middleware");
        next();
    }
};

validate.inventoryAddRules = () => {
    return [
        // Validate Make
        body('inv_make')
            .trim()
            .notEmpty()
            .withMessage('Make is required')
            .isLength({ max: 50 })
            .withMessage('Make cannot be longer than 50 characters'),

        // Validate Model
        body('inv_model')
            .trim()
            .notEmpty()
            .withMessage('Model is required')
            .isLength({ max: 50 })
            .withMessage('Model cannot be longer than 50 characters'),

        // Validate Year
        body('inv_year')
            .trim()
            .notEmpty()
            .withMessage('Year is required')
            .isNumeric()
            .withMessage('Year must be a number'),

        // Validate Description
        body('inv_description')
            .trim()
            .notEmpty()
            .withMessage('Description is required'),

        // Validate Image Path
        body('inv_image')
            .trim()
            .notEmpty()
            .withMessage('Image path is required'),

        // Validate Thumbnail Path
        body('inv_thumbnail')
            .trim()
            .notEmpty()
            .withMessage('Thumbnail path is required'),

        // Validate Price
        body('inv_price')
            .trim()
            .notEmpty()
            .withMessage('Price is required')
            .isNumeric()
            .withMessage('Price must be a number'),

        // Validate Miles
        body('inv_miles')
            .trim()
            .notEmpty()
            .withMessage('Miles is required')
            .isNumeric()
            .withMessage('Miles must be a number'),

        // Validate Color
        body('inv_color')
            .trim()
            .notEmpty()
            .withMessage('Color is required'),

        // Validate Classification ID
        body('classification_id')
            .trim()
            .notEmpty()
            .withMessage('Classification is required')
            .isNumeric()
            .withMessage('Classification must be a number')
    ];
};

validate.checkInventoryData = async (req, res, next) => {
    console.log("Got to checkInventoryData")
    
    const errors = validationResult(req);
    //console.log(errors)

    if (!errors.isEmpty()) {
        console.log("Got Into CheckInvData")
        let nav = await utilities.getNav();
        let classificationsResult = await invModel.getClassifications();
        let classifications = classificationsResult.rows ? classificationsResult.rows : [];
        res.render('inventory/add-inventory', {
            title: 'Build Inventory Management',
            nav,
            errors,
            classifications,
            // Include existing form data for sticky form behavior
            inventoryData: req.body,
        });
    } else {
        next();
    }
};



module.exports = validate