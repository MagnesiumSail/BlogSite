const pool = require("../database")
const bcrypt = require("bcryptjs");

/* *****************************
*   Register new account
* *************************** */
async function registerAccount(account_firstname, account_lastname, account_email, account_password){
    try {
      const sql = "INSERT INTO account (account_firstname, account_lastname, account_email, account_password, account_type) VALUES ($1, $2, $3, $4, 'Client') RETURNING *"
      return await pool.query(sql, [account_firstname, account_lastname, account_email, account_password])
    } catch (error) {
      return error.message
    }
  }

/* **********************
 *   Check for existing email
 * ********************* */
async function checkExistingEmail(account_email){
  try {
    const sql = "SELECT * FROM account WHERE account_email = $1"
    const email = await pool.query(sql, [account_email])
    return email.rowCount
  } catch (error) {
    return error.message
  }
}

/* *****************************
* Return account data using email address
* ***************************** */
async function getAccountByEmail (account_email) {
  try {
    const result = await pool.query(
      'SELECT account_id, account_firstname, account_lastname, account_email, account_type, account_password FROM account WHERE account_email = $1',
      [account_email])
    return result.rows[0]
  } catch (error) {
    return new Error("No matching email found")
  }
}

/* *****************************
* Return account data using id
* ***************************** */
async function getAccountById (account_id) {
  try {
    const result = await pool.query(
      'SELECT account_id, account_firstname, account_lastname, account_email, account_type, account_password FROM account WHERE account_id = $1',
      [account_id])
    return result.rows[0]
  } catch (error) {
    return new Error("No matching id found")
  }
}

/* ***************************
 *  Update Account info
 * ************************** */
async function updateAccount(account_firstname, account_lastname, account_email, account_id) {
  try {
    // Updated SQL query to include RETURNING *
    const sql = "UPDATE account SET account_firstname = $1, account_lastname = $2, account_email = $3 WHERE account_id = $4 RETURNING *";
    const data = await pool.query(sql, [account_firstname, account_lastname, account_email, account_id]);
    return data.rows[0];
  } catch (error) {
    console.error("Update Account Error: " + error);
  }
}

/* ***************************
 *  Update Password
 * ************************** */
async function updatePassword(account_password, account_id) {
  try {
    // Updated SQL query to include RETURNING *
    let hashedPassword
    try {
    // regular password and cost (salt is generated automatically)
    hashedPassword = await bcrypt.hashSync(account_password, 10)
    } catch (error) {
      console.error("Hashing Error: " + error);
      return;
    }
    const sql = "UPDATE account SET account_password = $1 WHERE account_id = $2 RETURNING *";
    const data = await pool.query(sql, [hashedPassword, account_id]);
    return data.rows[0];
  } catch (error) {
    console.error("Update Password Error: " + error);
    return;
  }
}



module.exports = { registerAccount, checkExistingEmail, getAccountByEmail, updateAccount, updatePassword, getAccountById};