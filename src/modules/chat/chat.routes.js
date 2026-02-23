const express = require("express");
const router = express.Router();
const ChatController = require("./chat.controller");
const { protect } = require("../auth/auth.middleware");

router.use(protect);

router.post("/", ChatController.sendMessage);
// ✅ Standardized parameter to :id to match ChatController destructuring
router.get("/:id", ChatController.getMessages);

module.exports = router;