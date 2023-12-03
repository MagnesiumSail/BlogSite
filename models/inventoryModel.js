const pool = require("../database")

/* ***************************
 *  Get all classification data
 * ************************** */
async function getClassifications(){
  return await pool.query("SELECT * FROM public.classification ORDER BY classification_name")
}


/* ***************************
 *  Get all inventory items and classification_name by classification_id
 * ************************** */
async function getInventoryByClassificationId(classification_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i 
      JOIN public.classification AS c 
      ON i.classification_id = c.classification_id 
      WHERE i.classification_id = $1`,
      [classification_id]
    )
    return data.rows
  } catch (error) {
    console.error("getclassificationsbyid error " + error)
  }
}

/* ***************************
 *  return a specific vehicle object by lookup of inv_id
 * ************************** */
async function getVehicleById(id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory WHERE inv_id = $1`,
      [id]
    );
    if (data.rows.length) {
      return data.rows[0]; // assuming ID is unique, and you want to return the first matching row
    } else {
      return null; // or however you want to handle no results found
    }
  } catch (error) {
    console.error("getVehicleById error: " + error);
    throw error;
  }
}

/* ***************************
 *  insert new classification into DB
 * ************************** */
insertClassification = async (classificationName) => {
  try {

      const sql = "INSERT INTO classification (classification_name) VALUES ($1) RETURNING *";
      const result = await pool.query(sql, [classificationName]);

      return result.rows[0];
  } catch (error) {
      console.error('Error in model:', error);
      throw error; // Propagate the error to be handled by the caller
  }
};

/* ***************************
 *  Insert Inventory Item into DB
 * ************************** */
insertInventoryItem = async (inventoryData) => {
  try {

      const sql = `
          INSERT INTO inventory 
          (inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id) 
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
          RETURNING *`;
      const values = [
          inventoryData.inv_make,
          inventoryData.inv_model,
          inventoryData.inv_year,
          inventoryData.inv_description,
          inventoryData.inv_image,
          inventoryData.inv_thumbnail,
          inventoryData.inv_price,
          inventoryData.inv_miles,
          inventoryData.inv_color,
          inventoryData.classification_id
      ];
      const result = await pool.query(sql, values);

      return result.rows[0];
  } catch (error) {
      console.error('Error in insertInventoryItem model:', error);
      throw error; // Propagate the error to be handled by the caller
  }
};

/* ***************************
 *  Update Inventory Data
 * ************************** */
async function updateInventory(
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
) {
  try {
    const sql =
      "UPDATE public.inventory SET inv_make = $1, inv_model = $2, inv_description = $3, inv_image = $4, inv_thumbnail = $5, inv_price = $6, inv_year = $7, inv_miles = $8, inv_color = $9, classification_id = $10 WHERE inv_id = $11 RETURNING *"
    const data = await pool.query(sql, [
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
      inv_id
    ])
    return data.rows[0]
  } catch (error) {
    console.error("model error: " + error)
  }
}

/* ***************************
 *  Delete Inventory Data
 * ************************** */
async function deleteInventory(inv_id) {
  try {
    const sql = 'DELETE FROM inventory WHERE inv_id = $1';
    const data = await pool.query(sql, [inv_id])
    return data
  } catch (error) {
    console.error("Delete Inventory Error: " + error)
  }
}


module.exports = {getClassifications, getInventoryByClassificationId, getVehicleById, insertClassification, insertInventoryItem, updateInventory, deleteInventory};