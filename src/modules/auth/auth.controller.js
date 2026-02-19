const AuthService = require("./auth.service");

class AuthController {
  // ✅ Added 'next' to all methods to prevent middleware "not a function" errors
  register = async (req, res, next) => {
    try {
      await AuthService.register(req.body);
      return res.status(201).json({ 
        status: "success", 
        message: "Verification code sent to your email." 
      });
    } catch (err) {
      return res.status(400).json({ status: "error", message: err.message });
    }
  };

  login = async (req, res, next) => {
    try {
      const { user, token } = await AuthService.login(req.body.email, req.body.password);
      return res.json({ status: "success", user, token });
    } catch (err) {
      return res.status(401).json({ status: "error", message: err.message });
    }
  };

  verifyEmail = async (req, res, next) => {
    try {
      const { email, token } = req.body; 
      
      if (!email || !token) {
        throw new Error("Email and verification token are required.");
      }

      await AuthService.verifyEmail(email, token);
      return res.json({ status: "success", message: "Email verified successfully!" });
    } catch (err) {
      return res.status(400).json({ status: "error", message: err.message });
    }
  };

  forgotPassword = async (req, res, next) => {
    try {
      await AuthService.forgotPassword(req.body.email);
      return res.json({ status: "success", message: "Reset link sent." });
    } catch (err) {
      return res.status(400).json({ status: "error", message: err.message });
    }
  };

  resetPassword = async (req, res, next) => {
    try {
      await AuthService.resetPassword(req.body.token, req.body.password);
      return res.json({ status: "success", message: "Password updated." });
    } catch (err) {
      return res.status(400).json({ status: "error", message: err.message });
    }
  };
}

module.exports = new AuthController();