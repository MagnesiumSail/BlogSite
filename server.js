/* ******************************************
 * This server.js file is the primary file of the 
 * application. It is used to control the project.
 *******************************************/
/* ***********************
 * Require Statements
 *************************/
const express = require("express");
const env = require("dotenv").config();
const expressLayouts = require("express-ejs-layouts");
const app = express();
const static = require("./routes/static");
const baseController = require("./controllers/baseController");
const inventoryRoute = require("./routes/inventoryRoute");
const utilities = require('./utilities/');
const brickRoute = require("./routes/BrickRoute");
const accountRoute = require("./routes/accountRoute");
const session = require("express-session");
const pool = require('./database/');
const bodyParser = require("body-parser")

/************************
 * Middeware
 ************************/

app.use(session({
  store: new (require('connect-pg-simple')(session))({
    createTableIfMissing: true,
    pool,
  }),
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  name: 'sessionId',
}))

// Express Messages Middleware
app.use(require('connect-flash')())
app.use(function(req, res, next){
  res.locals.messages = require('express-messages')(req, res)
  next()
})

// body parser
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

/* ***********************
 * View Engine and Templates
 *************************/

app.set("view engine", "ejs")
app.use(expressLayouts)
app.set("layout", "./layouts/layout") // not at views root


/* ***********************
 * Routes
 *************************/
app.use(static)
// Index route
app.get("/", utilities.handleErrors(baseController.buildHome))
// Inventory routes
app.use("/inv", utilities.handleErrors(inventoryRoute))
// brick route
app.use("/Brick", utilities.handleErrors(brickRoute))
// account route
app.use("/account", utilities.handleErrors(accountRoute))


app.use(async (req, res, next) => {
  next({status: 404, message: 'Sorry, we appear to have lost that page.'})
})


/* ***********************
* Express Error Handler
* MUST come after all other middleware
*************************/
app.use(async (err, req, res, next) => {
  // Fetch navigation data using the utility function.
  let nav = await utilities.getNav();
  // Log the error along with the request URL to the console.
  console.error(`Error at: "${req.originalUrl}": ${err.message}`);
  // Determine the message to be displayed based on the error status.
  if(err.status == 404){ 
    message = err.message;
  } else if (err.status == 500) {
    message = 'This error is, was, and always will be intentional!';
  } else {
    message = 'Oh no! There was a crash. Maybe try a different route?';
  }
  // Render the error page with the appropriate title, message, and navigation data.
  res.render("errors/error", {
    title: err.status || 'Server Error',
    message,
    nav
  });
})



/* ***********************
 * Local Server Information
 * Values from .env (environment) file
 *************************/
const port = process.env.PORT
const host = process.env.HOST

/* ***********************
 * Log statement to confirm server operation
 *************************/
app.listen(port, () => {
  console.log(`app listening on ${host}:${port}`)
})
