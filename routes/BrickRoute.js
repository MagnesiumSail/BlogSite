//Need some stuff
const express = require("express")
const router = new express.Router() 
const brickController = require("../controllers/brickController")

// Route to build non existant file
router.get("/mistake", brickController.buildFakeError);

module.exports = router;