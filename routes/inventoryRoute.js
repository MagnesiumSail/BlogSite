// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const regValidate = require("../utilities/account-validation");
const { validateClassification } = require('../utilities/inventory-validation');

// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);
// inventoryRoute.js
router.get('/detail/:id', invController.getVehicleById);
// management route
router.get('/add/classification', invController.buildClassMngmnt);
router.get('/add/inventory', invController.buildInvMngmnt)
router.post("/add/classification", validateClassification, (req, res, next) => {
    console.log('Route handler reached with body:', req.body);
    next();  },
    invController.addClassification);


module.exports = router;