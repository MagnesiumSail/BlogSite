// Needed Resources
const express = require("express");
const router = new express.Router();
const utilities = require("../utilities/");
const accountController = require("../controllers/accountController");
const regValidate = require("../utilities/account-validation");

// Route to build account editor
router.get("/update", utilities.checkLogin, utilities.handleErrors(accountController.buildAccountEditor));
// Route to handle update account
router.post("/update", utilities.checkLogin, regValidate.updateAccountRules(), regValidate.checkUpdateData, utilities.handleErrors(accountController.updateAccount));
//Route to handle change password
router.post("/change-password", utilities.checkLogin, regValidate.updatePasswordRules(), regValidate.checkUpdatePasswordData, utilities.handleErrors(accountController.updatePassword));
// Route to build account view
router.get("/", utilities.checkLogin, utilities.handleErrors(accountController.buildAccount))
// Route to build inventory by account view
router.get("/login", utilities.handleErrors(accountController.buildLogin));
// Route to handle logout
router.get("/logout", utilities.handleErrors(accountController.accountLogout));
// Route to build register by register view
router.get(
  "/register",
  utilities.handleErrors(accountController.buildRegister)
);
router.post(
  "/register",
  regValidate.registationRules(),
  regValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
);
router.post(
  "/login",
  regValidate.loginRules(),
  regValidate.checkLoginData,
  utilities.handleErrors(accountController.accountLogin)
);


// Process the login attempt
/*router.post("/login", (req, res) => {
  res.status(200).send("login process");
});*/

module.exports = router;
