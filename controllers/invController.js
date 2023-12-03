const invModel = require("../models/inventoryModel");
const utilities = require("../utilities/");

const invCont = {};

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
    return next({
      status: 404,
      message: "Classification not found",
      errors: null,
    }); // Pass error to the next middleware (error handler)
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
    nav, // Passing navigation details
    grid, // Passing the grid layout of inventory items
  });
};

/* ***************************
 *  Build management view
 * ************************** */
invCont.buildMngmnt = async (req, res, next) => {
  let nav = await utilities.getNav();

  const classificationResult = await invModel.getClassifications();
  const classificationSelect = classificationResult.rows
    ? classificationResult.rows
    : [];
  res.render("inventory/management", {
    title: "Build Management",
    nav,
    errors: null,
    classificationSelect,
  });
};

/* ***************************
 *  Build add classification view
 * ************************** */
invCont.buildClassMngmnt = async (req, res, next) => {
  let nav = await utilities.getNav();
  res.render("inventory/add-classification", {
    title: "Build Class Management",
    nav,
    errors: null,
  });
};

/* ***************************
 *  Build add inventory item view
 * ************************** */
invCont.buildInvMngmnt = async (req, res, next) => {
  try {
    let nav = await utilities.getNav();
    let classificationsResult = await invModel.getClassifications();

    // Process the result to extract the array
    let classifications = classificationsResult.rows
      ? classificationsResult.rows
      : [];

    // Check if there are errors in the request body
    let errors = req.body.errors || [];

    res.render("inventory/add-inventory", {
      title: "Build Inventory Management",
      nav,
      errors: errors,
      classifications, // Now this should be an array
      inventoryData: req.body, // Include the previously submitted form data
    });
  } catch (error) {
    console.error("Error in buildInvMngmnt:", error);
    res.status(500).send("Error building inventory management view");
  }
};

/* ***************************
 *  build vehicle detail view
 * ************************** */
invCont.getVehicleById = async (req, res, next) => {
  try {
    // Fetch vehicle data using the provided ID from request parameters
    const vehicle = await invModel.getVehicleById(req.params.id);

    // Check if the vehicle data exists
    if (!vehicle) {
      return next({ status: 404, message: "Vehicle not found" }); // Pass error to the next middleware (error handler)
    }

    // Convert the vehicle data into HTML format for display
    const htmlContent = utilities.wrapVehicleInHtml(vehicle);
    // Retrieve navigation details
    const navData = await utilities.getNav();
    // Render the vehicle detail view with vehicle data, its HTML content, title, and navigation details
    res.render("inventory/vehicleDetail", {
      vehicle: vehicle,
      content: htmlContent,
      title: `${vehicle.inv_make} ${vehicle.inv_model}`,
      nav: navData,
    });
  } catch (error) {
    // Handle any errors during the process
    next(error);
  }
};

/* ***************************
 *  add new classification
 * ************************** */
invCont.addClassification = async (req, res) => {
  try {
    const classification_name = req.body.classification_name;

    if (!classification_name) {
      console.error("Classification name is missing or null");
      return res.status(400).send("Classification name is required");
    }

    await invModel.insertClassification(classification_name);

    console.log("Classification inserted successfully");
    res.redirect("/inv/add/classification");
  } catch (error) {
    console.error("Error in controller:", error);
    res.status(500).send("Error adding classification");
  }
};

/* ***************************
 *  Add new inventory item
 * ************************** */
invCont.addInventory = async (req, res) => {
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
      classification_id,
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
      classification_id,
    });

    console.log("Inventory item inserted successfully");
    // Redirecting or sending a success response
    req.flash("success", "Inventory item added successfully");
    res.redirect("/inv/add/inventory");
  } catch (error) {
    console.error("Error in addInventory controller:", error);
    // Sending an error response or redirecting to an error page
    req.flash("error", "Error adding inventory item");
    res.redirect("/inv/add/inventory");
  }
};

/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id);
  const invData = await invModel.getInventoryByClassificationId(
    classification_id
  );
  if (invData[0].inv_id) {
    return res.json(invData);
  } else {
    next(new Error("No data returned"));
  }
};

/* ***************************
 *  Build Edit Inventory View
 * ************************** */
invCont.buildEditInv = async (req, res, next) => {
  try {
    let nav = await utilities.getNav();
    let itemData = await invModel.getVehicleById(req.params.invId);
    let classificationsResult = await invModel.getClassifications();
    // Process the result to extract the array
    let classifications = classificationsResult.rows
      ? classificationsResult.rows
      : [];
    // Check if there are errors in the request body
    let errors = req.body.errors || [];
    const itemName = `${itemData.inv_make} ${itemData.inv_model}`;
    res.render("inventory/edit-inventory", {
      title: "Edit " + itemName,
      nav,
      errors: errors,
      classifications, // Now this should be an array
      inv_id: itemData.inv_id,
      inv_make: itemData.inv_make,
      inv_model: itemData.inv_model,
      inv_year: itemData.inv_year,
      inv_description: itemData.inv_description,
      inv_image: itemData.inv_image,
      inv_thumbnail: itemData.inv_thumbnail,
      inv_price: itemData.inv_price,
      inv_miles: itemData.inv_miles,
      inv_color: itemData.inv_color,
      classification_id: itemData.classification_id // Include the previously submitted form data
    });
  } catch (error) {
    console.error("Error in buildInvMngmnt:", error);
    res.status(500).send("Error building inventory management view");
  }
};

/* ***************************
 *  Update Inventory Data
 * ************************** */
invCont.updateInventory = async function (req, res, next) {
  let nav = await utilities.getNav()
  const {
    inv_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id,
  } = req.body
  const updateResult = await invModel.updateInventory(
    inv_id,  
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id
  )

  if (updateResult) {
    const itemName = updateResult.inv_make + " " + updateResult.inv_model
    req.flash("notice", `The ${itemName} was successfully updated.`)
    res.redirect("/inv/")
  } else {
    const classificationSelect = await utilities.buildClassificationList(classification_id)
    const itemName = `${inv_make} ${inv_model}`
    req.flash("notice", "Sorry, the insert failed.")
    res.status(501).render("inventory/edit-inventory", {
    title: "Edit " + itemName,
    nav,
    classificationSelect: classificationSelect,
    errors: null,
    inv_id,
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
    })
  }
}

/* ***************************
 *  Build Delete Inventory
 * Confirmation view
 * ************************** */
invCont.buildDelInv= async (req, res, next) => {
  try {
    let nav = await utilities.getNav();
    let inventoryId = parseInt(req.params.invId, 10);
    let itemData = await invModel.getVehicleById(inventoryId);
    let classificationsResult = await invModel.getClassifications();
    // Process the result to extract the array
    let classifications = classificationsResult.rows
      ? classificationsResult.rows
      : [];
    // Check if there are errors in the request body
    let errors = req.body.errors || [];
    const itemName = `${itemData.inv_make} ${itemData.inv_model}`;
    res.render("inventory/delete-confirm", {
      title: "Edit " + itemName,
      nav,
      errors: errors,
      classifications, // Now this should be an array
      inv_id: itemData.inv_id,
      inv_make: itemData.inv_make,
      inv_model: itemData.inv_model,
      inv_year: itemData.inv_year,
      inv_description: itemData.inv_description,
      inv_image: itemData.inv_image,
      inv_thumbnail: itemData.inv_thumbnail,
      inv_price: itemData.inv_price,
      inv_miles: itemData.inv_miles,
      inv_color: itemData.inv_color,
      inventoryId: inventoryId,
      classification_id: itemData.classification_id // Include the previously submitted form data
    });
  } catch (error) {
    console.error("Error in buildInvMngmnt:", error);
    res.status(500).send("Error building inventory management view");
  }
};

/* ***************************
 *  Delete Inventory Data
 * ************************** */
invCont.deleteInventory = async function (req, res, next) {
  let inv_id = parseInt(req.body.inv_id, 10);
  const updateResult = await invModel.deleteInventory(inv_id);
  if (updateResult) {
    const itemName = updateResult.inv_make + " " + updateResult.inv_model;
    req.flash("notice", `The vehicle was successfully deleted.`);
    res.redirect("/inv/");
  } else {
    req.flash("notice", "Sorry, the delete failed.");
    res.redirect("/delete/inventory");
  }
}

module.exports = invCont;
