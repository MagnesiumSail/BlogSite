// Import utilities module to utilize its functionalities.
const utilities = require("../utilities/");
// Initialize an empty object to store controller methods.
const baseController = {};
// Async function to build the home page.
baseController.buildHome = async function(req, res){
  // Fetch navigation data using the utility function.
  const nav = await utilities.getNav();
  // Render the home page with the provided title and navigation data.
  res.render("index", {title: "Home", nav, errors: null});
}
// Export the controller for use in other parts of the application.
module.exports = baseController;