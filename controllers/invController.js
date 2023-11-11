const invModel = require("../models/inventoryModel");

const utilities = require("../utilities/")

const invCont = {}



/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  // Extract the classification ID from the request parameters
  const classification_id = req.params.classificationId;
  // Fetch inventory data related to the given classification ID
  const data = await invModel.getInventoryByClassificationId(classification_id);

// Check if any data was returned
if (!data || data.length === 0) {
  return next({ status: 404, message: 'Classification not found' , errors: null,});  // Pass error to the next middleware (error handler)
}

  // Generate a grid layout for the fetched inventory items
  const grid = await utilities.buildClassificationGrid(data);
  // Fetch navigation details (possibly menus, links, etc.)
  let nav = await utilities.getNav();
  // Extract the classification name from the first inventory item
  // (Assuming all items have the same classification name)
  const className = data[0].classification_name;
  // Render the classification view, passing in the title, navigation details, and grid layout
  res.render("./inventory/classification", {
    title: className + " vehicles", // Setting the page title
    nav,                            // Passing navigation details
    grid,                           // Passing the grid layout of inventory items
  });
}


// inventoryController.js
invCont.getVehicleById = async (req, res, next) => {
  try {
    // Fetch vehicle data using the provided ID from request parameters
    const vehicle = await invModel.getVehicleById(req.params.id);

// Check if the vehicle data exists
if (!vehicle) {
  return next({ status: 404, message: 'Vehicle not found' });  // Pass error to the next middleware (error handler)
}

    // Convert the vehicle data into HTML format for display
    const htmlContent = utilities.wrapVehicleInHtml(vehicle);
    // Retrieve navigation details
    const navData = await utilities.getNav();
    // Render the vehicle detail view with vehicle data, its HTML content, title, and navigation details
    res.render('inventory/vehicleDetail', { vehicle: vehicle, content: htmlContent, title: `${vehicle.inv_make} ${vehicle.inv_model}`, nav: navData });

  } catch (error) { // Handle any errors during the process
    next(error);
  }
};



module.exports = invCont