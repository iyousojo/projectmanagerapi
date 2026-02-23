const AuthService = require("./auth.service");

class AuthController {
  register = async (req, res, next) => {
    try {
      await AuthService.register(req.body);
      res.status(201).json({ status: "success", message: "Registration successful!" });
    } catch (err) { next(err); }
  };

  login = async (req, res, next) => {
    try {
      const { email, password, expoPushToken } = req.body;
      const data = await AuthService.login(email, password, expoPushToken);
      res.json({ status: "success", ...data });
    } catch (err) { next(err); }
  };

  getProfile = async (req, res, next) => {
    try {
      const user = await AuthService.getUserProfile(req.user.id);
      res.json(user);
    } catch (err) { next(err); }
  };

  verifyEmail = async (req, res, next) => {
    try {
      await AuthService.verifyEmail(req.body.email, req.body.token);
      res.json({ status: "success", message: "Email verified!" });
    } catch (err) { next(err); }
  };

  forgotPassword = async (req, res, next) => {
    try {
      await AuthService.forgotPassword(req.body.email);
      res.json({ status: "success", message: "Reset link sent." });
    } catch (err) { next(err); }
  };

  resetPassword = async (req, res, next) => {
    try {
      await AuthService.resetPassword(req.body.token, req.body.password);
      res.json({ status: "success", message: "Password updated!" });
    } catch (err) { next(err); }
  };
}

module.exports = new AuthController();