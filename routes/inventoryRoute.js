// Needed Resources
const express = require("express");
const router = new express.Router();
const utilities = require("../utilities/");
const invController = require("../controllers/invController");
const validate = require("../utilities/inventory-validation");

router.post(
  "/add/inventory",(req, res, next) => {
    console.log("Server received form data:", req.body);
    console.log("WHY IS THERE NO BODY????? I have spent 8 hours trying to fix this. this class is not worth the time sink the work load is 10x any other 3 credit at BYUI, and brother robertson does not teach me 1/100000 of the information I need to be able to complete any of these assignments, especially the debugging aspect because that's 99.99% of what my time is spent on")
    next();
},
  validate.inventoryAddRules(),
  validate.checkInventoryData,
  invController.addInventory
);
// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);
// inventoryRoute.js
router.get("/detail/:id", invController.getVehicleById);
// management route
router.get("/add/classification", invController.buildClassMngmnt);
router.get("/add/inventory", invController.buildInvMngmnt);
router.get("/add/", invController.buildMngmnt);
router.post(
  "/add/classification",
  (req, res, next) => {
    console.log("Request Body at the beginning of the route:", req.body);
    
    next();
  },
  validate.classificationNameRules(),
  validate.checkClassAdd,
  invController.addClassification
);
module.exports = router;
