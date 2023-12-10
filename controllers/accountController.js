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

/* ****************************************
 *  Deliver Registration view
 * *************************************** */
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
  console.log(accountData)
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
    } else {
      //invalid password
      req.flash("notice", "Invalid Credentials. Please try again.")
      res.redirect("/account/login")
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
    title: "Edit Account",
    nav,
    errors: null,
  });
}

/* ****************************************
 *  Process account update
 * ************************************ */
async function updateAccount(req, res) {
  try {
    // Update the account first
    const updateResult = await accountModel.updateAccount(
      req.body.account_firstname,
      req.body.account_lastname,
      req.body.account_email,
      req.body.account_id,
    );

    // Check if the update was successful
    if (updateResult) {
      // Query the database again for the updated account info using email
      const updatedAccount = await accountModel.getAccountById(req.body.account_id);

      if (updatedAccount) {
        // Decode the JWT
        const decoded = jwt.verify(req.cookies.jwt, process.env.ACCESS_TOKEN_SECRET);

        // Update the account info in the JWT payload
        decoded.account_firstname = updatedAccount.account_firstname;
        decoded.account_lastname = updatedAccount.account_lastname;
        decoded.account_email = updatedAccount.account_email;

        // Sign a new JWT with the updated data
        const newToken = jwt.sign(decoded, process.env.ACCESS_TOKEN_SECRET);

        // Set the new JWT as a cookie
        res.cookie('jwt', newToken, { httpOnly: true });

        // Update res.locals.accountName
        res.locals.accountName = updatedAccount.account_firstname;

        req.flash("notice", `Congratulations, your account has been updated ${updatedAccount.account_firstname}.`);
        res.redirect("/account/");
      } else {
        throw new Error('Unable to retrieve updated account information.');
      }
    } else {
      throw new Error('Account update failed.');
    }
  } catch (error) {
    console.error(error);
    req.flash("error", error.message);
    res.redirect("/account/update");
  }
}


/* ****************************************
 *  Process password update
 * ************************************ */
async function updatePassword(req, res) {
  console.log(req.body)
  const regResult = await accountModel.updatePassword(
    req.body.account_new_password,
    req.body.account_id,
  );
  if(regResult) {
    console.log("Password updated");
    req.flash("notice", `Congratulations, your password has been updated.`);
    res.redirect("/account/");
  } else {
    console.log("Password update failed");
    req.flash("notice", `Sorry, your password update failed.`);
    res.redirect("/account/");
  }
}

/* ****************************************
 *  Process Logout request
 * *************************************** */
async function accountLogout(req, res) {
  console.log("Logout");
  res.clearCookie("jwt");
  res.redirect("/");
}

module.exports = { buildLogin, buildRegister, registerAccount, accountLogin, buildAccount, buildAccountEditor, updateAccount, updatePassword, accountLogout};
