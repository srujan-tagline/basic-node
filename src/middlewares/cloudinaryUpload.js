const multer = require("multer");
const {CloudinaryStorage} = require("multer-storage-cloudinary");
const cloudinary = require("../../config/cloudinary");


const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "profile-pictures",
    allowed_formats: ["jpeg", "png", "jpg"],
  },
});

const upload = multer({storage});

module.exports = upload;