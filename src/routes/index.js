const express = require("express");
const authRoutes = require("./authRoutes");
const teacherRoutes = require("./teacherRoutes");
const studentRoutes = require("./studentRoutes");
const router = express.Router();

router.use("/auth", authRoutes);
router.use("/teacher", teacherRoutes);
router.use("/student", studentRoutes);

module.exports = router;
