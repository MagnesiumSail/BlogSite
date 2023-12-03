// Import utilities module to utilize its functionalities.
const jwt = require("jsonwebtoken")
require("dotenv").config()
const utilities = require("../utilities/");
const accountModel = require("../models/account-model");
const bcrypt = require("bcryptjs");

/* ****************************************
 *  Deliver login view
 * *************************************** */
async function buildLogin(req, res, next) {
  let nav = await utilities.getNav();
  res.render("account/login", {
    title: "Login",
    nav,
    errors: null,
  });
}

async function buildRegister(req, res, next) {
  let nav = await utilities.getNav();
  res.render("account/register", {
    title: "Register",
    nav,
    errors: null,
  });
}
/* ****************************************
 *  Deliver Management view
 * *************************************** */
async function buildAccount(req, res, next) {
  let nav = await utilities.getNav();
  res.render("account/management", {
    title: "Account",
    nav,
    errors: null,
  });
}

/* ****************************************
 *  Process Registration
 * *************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav();
  const {
    account_firstname,
    account_lastname,
    account_email,
    account_password,
  } = req.body;

  // Hash the password before storing
  let hashedPassword
  try {
    // regular password and cost (salt is generated automatically)
    hashedPassword = await bcrypt.hashSync(account_password, 10)
  } catch (error) {
    req.flash("notice", 'Sorry, there was an error processing the registration.')
    res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    })
  }

  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
  );

  if (regResult) {
    req.flash(
      "notice",
      `Congratulations, you\'re registered ${account_firstname}. Please log in.`
    );
    res.status(201).render("account/login", {
      title: "Login",
      nav,
    });
  } else {
    req.flash("notice", "Sorry, the registration failed.");
    res.status(501).render("account/register", {
      title: "Registration",
      nav,
    });
  }
}

/* ****************************************
 *  Process login request
 * ************************************ */
// Define an asynchronous function for account login
async function accountLogin(req, res) {
  // Retrieve navigation data
  let nav = await utilities.getNav()
  // Extract email and password from the request body
  const { account_email, account_password } = req.body
  // Fetch account data based on the provided email
  const accountData = await accountModel.getAccountByEmail(account_email)
  // If no account data is found, send an error message and render the login page
  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.")
    res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    })
    return
  }
  try {
    // Compare the provided password with the stored hashed password
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      // If the passwords match, remove the password from the account data
      delete accountData.account_password
      // Generate an access token using JWT
      const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 })
      // Set the access token in a cookie with HTTP-only flag and a max age
      res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
      // Redirect to the account page after successful login
      return res.redirect("/account/")
    }
  } catch (error) {
    // If there is an error in the try block, throw an access forbidden error
    return new Error('Access Forbidden')
  }
}

/* ****************************************
 *  build accout edit view
 * ************************************ */
async function buildAccountEditor(req, res) {
  let nav = await utilities.getNav();
  res.render("account/update", {
    title: "Account",
    nav,
    errors: null,
  });
}

module.exports = { buildLogin, buildRegister, registerAccount, accountLogin, buildAccount, buildAccountEditor };
