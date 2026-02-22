const AuthService = require("./auth.service");

class AuthController {
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

  login = async (req, res, next) => {
    try {
      // ✅ Updated to extract expoPushToken
      const { email, password, expoPushToken } = req.body;
      const data = await AuthService.login(email, password, expoPushToken);
      res.json({ status: "success", ...data });
    } catch (err) { 
      next(err); 
    }
  };

  verifyEmail = async (req, res, next) => {
    try {
      await AuthService.verifyEmail(req.body.email, req.body.token);
      res.json({ status: "success", message: "Email verified successfully!" });
    } catch (err) { 
      next(err); 
    }
  };

  forgotPassword = async (req, res, next) => {
    try {
      await AuthService.forgotPassword(req.body.email);
      res.json({ status: "success", message: "Password reset link sent to email." });
    } catch (err) {
      next(err);
    }
  };

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
      const userId = req.user.id; 
      const user = await AuthService.getUserProfile(userId);
      res.json(user);
    } catch (err) {
      next(err);
    }
  };
}

module.exports = new AuthController();