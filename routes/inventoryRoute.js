// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")

// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);
// inventoryRoute.js
router.get('/vehicle/:id', inventoryController.getVehicleById);

module.exports = router;