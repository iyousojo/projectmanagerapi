const AuthService = require("./auth.service");

class AuthController {
  /**
   * Handles user registration
   * Updated message to reflect that verification is skipped
   */
  register = async (req, res, next) => {
    try {
      await AuthService.register(req.body);
      res.status(201).json({ 
        status: "success", 
        message: "Registration successful! You can now log in immediately." 
      });
    } catch (err) { 
      next(err); 
    }
  };

  /**
   * Handles user login
   */
  login = async (req, res, next) => {
    try {
      const data = await AuthService.login(req.body.email, req.body.password);
      res.json({ status: "success", ...data });
    } catch (err) { 
      next(err); 
    }
  };

  /**
   * Verify Email (Currently auto-handled by service)
   */
  verifyEmail = async (req, res, next) => {
    try {
      await AuthService.verifyEmail(req.body.email, req.body.token);
      res.json({ status: "success", message: "Email verified successfully!" });
    } catch (err) { 
      next(err); 
    }
  };

  /**
   * Forgot Password request
   */
  forgotPassword = async (req, res, next) => {
    try {
      await AuthService.forgotPassword(req.body.email);
      res.json({ status: "success", message: "Password reset link sent to email." });
    } catch (err) {
      next(err);
    }
  };

  /**
   * Final Password Reset
   */
  resetPassword = async (req, res, next) => {
    try {
      await AuthService.resetPassword(req.body.token, req.body.password);
      res.json({ status: "success", message: "Password updated successfully!" });
    } catch (err) {
      next(err);
    }
  };

  getProfile = async (req, res, next) => {
    try {
      // req.user.id is populated by your authenticate middleware
      const userId = req.user.id; 
      const user = await AuthService.getUserProfile(userId);
      
      res.json(user);
    } catch (err) {
      next(err);
    }
  };
}

module.exports = new AuthController();