import multer from "multer";

const avatar = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/avatar");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
const moment = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/moments");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
const memory = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/memory");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
export const uploadAvatar = multer({ storage: avatar });
export const uploadMoment = multer({ storage: moment });
export const uploadMemory = multer({ storage: memory });
