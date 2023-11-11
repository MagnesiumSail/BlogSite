// Initialize an empty object to store controller methods.
const brickedController = {};


// Async function to build the home page.
brickedController.buildFakeError = async function(req, res, next){
    return next({ status: 500, message: 'Who am I' , errors: null,});  // Pass error to the next middleware (error handler)
}
// Export the controller for use in other parts of the application.
module.exports = brickedController;