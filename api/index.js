const express = require("express");
const router = express.Router();

const class2 = require("./class2");
router.use("/", class2);

module.exports = router;
