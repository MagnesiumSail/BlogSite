// Needed Resources
const express = require("express");
const router = new express.Router();
const utilities = require("../utilities/");
const invController = require("../controllers/invController");
const validate = require("../utilities/inventory-validation");
const accountvalidate = require("../utilities/account-validation");

router.post(
  "/add/inventory",(req, res, next) => {
    console.log("Server received form data:", req.body);
    next();
},
  validate.inventoryAddRules(),
  validate.checkInventoryData,
  utilities.handleErrors(invController.addInventory)
);

//Route for delete inventory
router.get("/delete/:invId", accountvalidate.checkAccountType, utilities.handleErrors(invController.buildDelInv));
//route for handling deletes
router.post("/delete/inventory", accountvalidate.checkAccountType, utilities.handleErrors(invController.deleteInventory));
// Route to handle updates
router.post("/update/", accountvalidate.checkAccountType, validate.inventoryAddRules(),
validate.checkUpdateData,
utilities.handleErrors(invController.updateInventory))
// Route to build inventory editor
router.get("/edit/:invId", accountvalidate.checkAccountType, utilities.handleErrors(invController.buildEditInv));
// Route to build inventory by classification view
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId));
// Route to display a list of vehicles by classification
router.get("/getInventory/:classification_id", utilities.handleErrors(invController.getInventoryJSON))
// inventoryRoute.js
router.get("/detail/:id", utilities.handleErrors(invController.getVehicleById));
// management route
router.get("/add/classification", accountvalidate.checkAccountType, utilities.handleErrors(invController.buildClassMngmnt));
router.get("/add/inventory", accountvalidate.checkAccountType, utilities.handleErrors(invController.buildInvMngmnt));
router.get("/", accountvalidate.checkAccountType, utilities.handleErrors(invController.buildMngmnt));
router.post("/", accountvalidate.checkAccountType, utilities.handleErrors(invController.buildMngmnt));
router.post(
  "/add/classification",
  (req, res, next) => {
    console.log("Request Body at the beginning of the route:", req.body);
    
    next();
  },
  accountvalidate.checkAccountType, 
  validate.classificationNameRules(),
  validate.checkClassAdd,
  invController.addClassification
);
module.exports = router;
