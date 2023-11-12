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

// inventoryModel.js
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

insertClassification = async (classificationName) => {
  try {
      console.log('Model function called with classificationName:', classificationName);

      const sql = "INSERT INTO classification (classification_name) VALUES ($1) RETURNING *";
      const result = await pool.query(sql, [classificationName]);

      return result.rows[0];
  } catch (error) {
      console.error('Error in model:', error);
      throw error; // Propagate the error to be handled by the caller
  }
};





module.exports = {getClassifications, getInventoryByClassificationId, getVehicleById, insertClassification};