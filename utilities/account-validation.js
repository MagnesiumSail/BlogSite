const utilities = require(".");
const { body, validationResult } = require("express-validator");
const validate = {};
const accountModel = require("../models/account-model");
const pool = require("../database")

validate.checkAccountType = (req, res, next) => {
  // Get the decoded JWT from res.locals.accountData
  const accountData = res.locals.accountData;

  // Check if the account type is 'Employee' or 'Admin'
  if (accountData && (accountData.account_type === 'Employee' || accountData.account_type === 'Admin')) {
    // If it is, proceed to the route handler
    next();
  } else {
    req.flash("notice", "You do not have permission to access this page.");
    res.redirect("/account/login")
    // If it's not, send an error message or redirect
    //res.status(403).send('Access denied. You do not have permission to access this page.');
  }
};

/*  **********************************
 *  Registration Data Validation Rules
 * ********************************* */
validate.registationRules = () => {
  return [
    // firstname is required and must be string
    body("account_firstname")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Please provide a first name."), // on error this message is sent.

    // lastname is required and must be string
    body("account_lastname")
      .trim()
      .isLength({ min: 2 })
      .withMessage("Please provide a last name."), // on error this message is sent.

    // valid email is required and cannot already exist in the DB
    body("account_email")
      .trim()
      .isEmail()
      .normalizeEmail() // refer to validator.js docs
      .withMessage("A valid email is required.")
      .custom(async (account_email) => {
        const emailExists = await accountModel.checkExistingEmail(
          account_email
        );
        if (emailExists) {
          throw new Error("Email exists. Please log in or use different email");
        }
      }),

    // password is required and must be strong password
    body("account_password")
      .trim()
      .isStrongPassword({
        minLength: 12,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage("Password does not meet requirements."),
  ];
};

/*  **********************************
*  updating account Rules
* ********************************* */
validate.updateAccountRules = () => {
  return [
    // First name validation
    body("account_firstname")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Please provide a first name."),

    // Last name validation
    body("account_lastname")
      .trim()
      .isLength({ min: 2 })
      .withMessage("Please provide a last name."),

    // Email validation
    body("account_email")
      .trim()
      .isEmail()
      .normalizeEmail()
      .withMessage("A valid email is required.")
      .custom(async (account_email, { req }) => {
        const accountId = req.body.account_id;

        // SQL query to check for existing email, excluding the current user's account
        const sql = "SELECT * FROM account WHERE account_email = $1 AND account_id != $2";
        const data = await pool.query(sql, [account_email, accountId]);

        // If an account other than the current one is using the email
        if (data.rows.length > 0) {
          throw new Error("Email already in use by another account.");
        }
      }),
  ];
};

/*  **********************************
*  Update Password Validation Rules
* ********************************* */
validate.updatePasswordRules = () => {
  return [
    // Password validation
    body("account_new_password")
      .trim()
      .isStrongPassword({
        minLength: 12,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage("Password does not meet requirements."),
  ];
};


/*  **********************************
*  Login Data Validation Rules
* ********************************* */
validate.loginRules = () => {
  return [
    // valid email is required and cannot already exist in the DB
    body("account_email")
      .trim()
      .isEmail()
      .normalizeEmail() // refer to validator.js docs
      .withMessage("A valid email is required."),

    // password is required and must be strong password
    body("account_password")
      .trim()
      .isStrongPassword({
        minLength: 12,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage("Password does not meet requirements."),
  ];
};

/* ******************************
 * Check data and return errors or continue to registration
 * ***************************** */
validate.checkRegData = async (req, res, next) => {
  const { account_firstname, account_lastname, account_email } = req.body;
  let errors = [];
  errors = validationResult(req);
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    res.render("account/register", {
      errors,
      title: "Registration",
      nav,
      account_firstname,
      account_lastname,
      account_email,
    });
    return;
  }
  next();
};

/* ******************************
 * Check Update Account Data and 
 * return errors or continue to login
 * ***************************** */
validate.checkUpdateData = async (req, res, next) => {
  const { account_firstname, account_lastname, account_email } = req.body;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    
    // Extracting just the error messages from the validation result
    const errorMessages = errors.array().map(err => err.msg);
    req.flash('errorMessages', errorMessages);

    return res.redirect('/account/update');
  }

  next();
};

/* ******************************
 * Check Password Update Data and 
 * return errors or continue to login
 * ***************************** */
validate.checkUpdatePasswordData = async (req, res, next) => {
  const { account_new_password } = req.body;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    
    // Extracting just the error messages from the validation result
    const errorMessages = errors.array().map(err => err.msg);
    req.flash('errorMessages', errorMessages);
    return res.redirect('/account/update');
  }

  next();
}

/* ******************************
 * Check Login data and return errors or continue to login
 * ***************************** */
validate.checkLoginData = async (req, res, next) => {
  const { account_email } = req.body;
  let errors = [];
  errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log("errors: ")
    console.log(errors);
    let nav = await utilities.getNav();
    req.flash(
      "notice",
      `Sorry, there was an error processing the login. Please try again.`
    );
    res.render("account/login", {
      errors,
      title: "Login",
      nav,
      account_email,
    });
    return;
  }
  next();
}

module.exports = validate;
