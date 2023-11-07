// Import utilities module to utilize its functionalities.
const utilities = require("../utilities/");

/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
  try {
    console.log("buildLogin start");
    let nav = await utilities.getNav();
    console.log("Navigation data:", nav);
    // ... rest of your original code ...
  } catch (error) {
    console.error("Error in buildLogin:", error);
    next(error); // Make sure to forward the error to the error handler
  }
}

  
  module.exports = { buildLogin }