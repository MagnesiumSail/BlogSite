const invModel = require("../models/inventoryModel");

const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)
  const grid = await utilities.buildClassificationGrid(data)
  let nav = await utilities.getNav()
  const className = data[0].classification_name
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  })
}

// inventoryController.js
invCont.getVehicleById = async (req, res, next) => {
  try {
    const vehicle = await invModel.getVehicleById(req.params.id);
    const htmlContent = utilities.wrapVehicleInHtml(vehicle);
    const navData = await utilities.getNav();
  res.render('inventory/vehicleDetail', { vehicle: vehicle, content: htmlContent, title: `${vehicle.inv_make} ${vehicle.inv_model}`, nav: navData });

  } catch (error) {
    next(error);
  }
};


module.exports = invCont