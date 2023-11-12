// Needed Resources
const express = require("express");
const router = new express.Router();
const invController = require("../controllers/invController");
const validate = require("../utilities/inventory-validation");

// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);
// inventoryRoute.js
router.get("/detail/:id", invController.getVehicleById);
// management route
router.get("/add/classification", invController.buildClassMngmnt);
router.get("/add/inventory", invController.buildInvMngmnt);
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
router.post(
  "/add/inventory",
  validate.inventoryAddRules(),
  validate.checkInventoryData,
  invController.addClassification
);
module.exports = router;
