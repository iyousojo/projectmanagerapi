const express = require("express");
const router = express.Router();
const AuthController = require("./auth.controller");

router.post("/register", AuthController.register);
router.post("/login", AuthController.login);
router.get("/verify/:token", AuthController.verifyEmail);
router.post("/forgot-password", AuthController.forgotPassword);
router.post("/reset-password", AuthController.resetPassword);

module.exports = router;