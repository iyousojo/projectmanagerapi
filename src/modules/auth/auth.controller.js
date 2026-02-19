const AuthService = require("./auth.service");

class AuthController {
  // ✅ Use arrow functions to preserve 'this' and handle 'next' correctly
  register = async (req, res, next) => {
    try {
      await AuthService.register(req.body);
      return res.status(201).json({ 
        status: "success", 
        message: "Verification code sent to your email." 
      });
    } catch (err) {
      next(err); // Pass error to your global error handler in app.js
    }
  };

  login = async (req, res, next) => {
    try {
      const { user, token } = await AuthService.login(req.body.email, req.body.password);
      return res.json({ status: "success", user, token });
    } catch (err) {
      next(err);
    }
  };

  verifyEmail = async (req, res, next) => {
    try {
      const { email, token } = req.body; 
      if (!email || !token) throw new Error("Email and token are required.");

      await AuthService.verifyEmail(email, token);
      return res.json({ status: "success", message: "Email verified successfully!" });
    } catch (err) {
      next(err);
    }
  };

  forgotPassword = async (req, res, next) => {
    try {
      await AuthService.forgotPassword(req.body.email);
      return res.json({ status: "success", message: "Reset link sent." });
    } catch (err) {
      next(err);
    }
  };

  resetPassword = async (req, res, next) => {
    try {
      await AuthService.resetPassword(req.body.token, req.body.password);
      return res.json({ status: "success", message: "Password updated." });
    } catch (err) {
      next(err);
    }
  };
}

module.exports = new AuthController();