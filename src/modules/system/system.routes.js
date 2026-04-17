const express = require("express");
const router = express.Router();
const controller = require("./system.controller");

router.get("/version", controller.getAppVersion);

module.exports = router;