const AuthService = require("./auth.service");

class AuthController {
  register = async (req, res) => {
    try {
      await AuthService.register(req.body);
      return res.status(201).json({ status: "success", message: "Check email." });
    } catch (err) {
      return res.status(400).json({ status: "error", message: err.message });
    }
  };

  login = async (req, res) => {
    try {
      const { user, token } = await AuthService.login(req.body.email, req.body.password);
      return res.json({ status: "success", user, token });
    } catch (err) {
      return res.status(401).json({ status: "error", message: err.message });
    }
  };

  verifyEmail = async (req, res) => {
    try {
      const token = req.body.token || req.params.token;
      await AuthService.verifyEmail(token);
      return res.json({ status: "success", message: "Verified!" });
    } catch (err) {
      return res.status(400).json({ status: "error", message: err.message });
    }
  };

  forgotPassword = async (req, res) => {
    try {
      await AuthService.forgotPassword(req.body.email);
      return res.json({ status: "success", message: "Reset link sent." });
    } catch (err) {
      return res.status(400).json({ status: "error", message: err.message });
    }
  };

  resetPassword = async (req, res) => {
    try {
      await AuthService.resetPassword(req.body.token, req.body.password);
      return res.json({ status: "success", message: "Password updated." });
    } catch (err) {
      return res.status(400).json({ status: "error", message: err.message });
    }
  };
}

// ✅ CRITICAL: You MUST use 'new' and it MUST be at the bottom
module.exports = new AuthController();