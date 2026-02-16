const express = require("express");
const router = express.Router();
const AuthController = require("./auth.controller"); 

// Debugging: This will print if the controller loaded correctly
// If this logs "undefined", the issue is in your controller's module.exports
console.log("AuthController loaded:", !!AuthController);

router.post("/register", AuthController.register);
router.post("/login", AuthController.login);
router.post("/verify-email", AuthController.verifyEmail);
router.post("/forgot-password", AuthController.forgotPassword);
router.post("/reset-password", AuthController.resetPassword);

module.exports = router;