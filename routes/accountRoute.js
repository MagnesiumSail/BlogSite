// Needed Resources 
const express = require("express")
const router = new express.Router() 
const utilities = require("../utilities/");
const accountController = require("../controllers/accountController")

// Route to build inventory by account view
router.get("/login", utilities.handleErrors(accountController.buildLogin));
// Route to build register by register view
router.post('/register', utilities.handleErrors(accountController.registerAccount))


module.exports = router;