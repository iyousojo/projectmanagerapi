const AuthService = require("./auth.service");

class AuthController {
  // 1. App calls this after opening from the Netlify 'Verified' link
  verifyEmail = async (req, res) => {
    try {
      const token = req.body.token || req.params.token;
      await AuthService.verifyEmail(token);
      return res.status(200).json({ 
        status: "success", 
        message: "Email verified successfully!" 
      });
    } catch (err) {
      return res.status(400).json({ status: "error", message: err.message });
    }
  };

  // 2. App calls this when user enters email in 'Forgot Password' screen
  forgotPassword = async (req, res) => {
    try {
      await AuthService.forgotPassword(req.body.email);
      return res.json({ status: "success", message: "Reset link sent to email." });
    } catch (err) {
      return res.status(400).json({ status: "error", message: err.message });
    }
  };

  // 3. App calls this when user clicks 'Submit' on the 'New Password' screen
  resetPassword = async (req, res) => {
    try {
      await AuthService.resetPassword(req.body.token, req.body.password);
      return res.json({ status: "success", message: "Password reset successful." });
    } catch (err) {
      return res.status(400).json({ status: "error", message: err.message });
    }
  };

  // Standard Login/Register
  login = async (req, res) => {
    try {
      const { user, token } = await AuthService.login(req.body.email, req.body.password);
      return res.json({ status: "success", user, token });
    } catch (err) {
      return res.status(401).json({ status: "error", message: err.message });
    }
  };
}

module.exports = new AuthController();