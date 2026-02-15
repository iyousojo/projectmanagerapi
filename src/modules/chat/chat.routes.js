const express = require("express");
const router = express.Router();
const ChatController = require("./chat.controller");
const { protect } = require("../auth/auth.middleware");

router.use(protect);

router.post("/", ChatController.sendMessage);

// targetId can be a User ID (for DMs) or Project ID (for Groups)
router.get("/:targetId", ChatController.getMessages);

module.exports = router;