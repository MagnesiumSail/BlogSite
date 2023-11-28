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

invCont.buildMngmnt = async (req, res, next) => {
  let nav = await utilities.getNav();
  res.render("inventory/management", {
    title: "Build Management",
    nav,
    errors: null,
  });
}


invCont.buildClassMngmnt = async (req, res, next) => {
  let nav = await utilities.getNav();
  res.render("inventory/add-classification", {
    title: "Build Class Management",
    nav,
    errors: null,
  });
}

invCont.buildInvMngmnt = async (req, res, next) => {
  console.log("Went Wrong Way!");
  try {
      let nav = await utilities.getNav();
      let classificationsResult = await invModel.getClassifications();

      // Process the result to extract the array
      let classifications = classificationsResult.rows ? classificationsResult.rows : [];

      // Check if there are errors in the request body
      let errors = req.body.errors || [];

      res.render("inventory/add-inventory", {
          title: "Build Inventory Management",
          nav,
          errors: errors,
          classifications, // Now this should be an array
          inventoryData: req.body // Include the previously submitted form data
      });
  } catch (error) {
      console.error('Error in buildInvMngmnt:', error);
      res.status(500).send('Error building inventory management view');
  }
};




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

invCont.addClassification = async (req, res) => {
  try {
    const classification_name = req.body.classification_name;
    console.log('Controller function reached with classification name:', classification_name);

    if (!classification_name) {
        console.error('Classification name is missing or null');
        return res.status(400).send('Classification name is required');
    }

    await invModel.insertClassification(classification_name);

    console.log('Classification inserted successfully');
    res.redirect('/inv/add/classification');
} catch (error) {
    console.error('Error in controller:', error);
    res.status(500).send('Error adding classification');
}
};

invCont.addInventory = async (req, res) => {
  console.log("Got to add inv")
  try {
      // Extracting inventory data from request body
      const {
          inv_make,
          inv_model,
          inv_year,
          inv_description,
          inv_image,
          inv_thumbnail,
          inv_price,
          inv_miles,
          inv_color,
          classification_id
      } = req.body;

      // Calling the model function to insert the data
      await invModel.insertInventoryItem({
          inv_make,
          inv_model,
          inv_year,
          inv_description,
          inv_image,
          inv_thumbnail,
          inv_price,
          inv_miles,
          inv_color,
          classification_id
      });

      console.log('Inventory item inserted successfully');
      // Redirecting or sending a success response
      req.flash('success', 'Inventory item added successfully');
      res.redirect('/inv/add/inventory');
  } catch (error) {
      console.error('Error in addInventory controller:', error);
      // Sending an error response or redirecting to an error page
      req.flash('error', 'Error adding inventory item');
      res.redirect('/inv/add/inventory');
  }
};



module.exports = invCont