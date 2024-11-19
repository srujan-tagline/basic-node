const express = require("express");
const authRoutes = require("./authRoute");
// const userRoutes = require("./user");
// const examRoutes = require("./exam");
// const resultRoutes = require("./result");

const router = express.Router();

router.use("/auth", authRoutes);
// router.use("/user", userRoutes);
// router.use("/exam", examRoutes);
// router.use("/result", resultRoutes);

module.exports = router;
