// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const regValidate = require("../utilities/account-validation");

// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);
// inventoryRoute.js
router.get('/detail/:id', invController.getVehicleById);
// management route
router.get('/add/classification', invController.buildClassMngmnt);
router.get('/add/inventory', invController.buildInvMngmnt)
router.post(
    "/add/classification",
    regValidate.registationRules(),
    regValidate.checkRegData,
    utilities.handleErrors(accountController.registerAccount)
  );


module.exports = router;