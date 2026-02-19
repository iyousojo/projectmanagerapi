const express = require("express");
const router = express.Router();
const AuthController = require("./auth.controller"); 

// ✅ Wrap calls in (req, res, next) to ensure arguments are passed correctly
router.post("/register", (req, res, next) => AuthController.register(req, res, next));
router.post("/login", (req, res, next) => AuthController.login(req, res, next));
router.post("/verify-email", (req, res, next) => AuthController.verifyEmail(req, res, next));
router.post("/forgot-password", (req, res, next) => AuthController.forgotPassword(req, res, next));
router.post("/reset-password", (req, res, next) => AuthController.resetPassword(req, res, next));

module.exports = router;