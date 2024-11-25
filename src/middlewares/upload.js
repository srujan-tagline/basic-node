const multer = require("multer");
const path = require("path");

// const storage = multer.diskStorage({
//   destination: "uploads/profile-pictures",
//   filename: (req, file, cb) => {
//     cb(
//       null,
//       file.fieldname + "_" + Date.now() + path.extname(file.originalname)
//     );
//   },
// });

const storage = multer.memoryStorage();

// Multer upload instance
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10000000,
  },
  fileFilter(req, file, cb) {
    if (
      file.mimetype == "image/png" ||
      file.mimetype == "image/jpg" ||
      file.mimetype == "image/jpeg"
    ) {
      cb(null, true);
    } else {
      return cb(new Error("Only .png, .jpg and .jpeg format allowed!"), false);
    }
  },
});

module.exports = upload;
