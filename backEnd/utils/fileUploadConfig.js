import multer from "multer";
import fs from "fs";
import path from "path";

const allowedMimes = [
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/csv",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "image/jpeg",
  "image/png",
  "image/gif",
];

// File upload configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "./uploads/mics";
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedExt = /xlsx|xls|csv|pdf|doc|docx|txt|jpg|jpeg|png|gif/;
  const ext = allowedExt.test(path.extname(file.originalname).toLowerCase());

  if (ext && allowedMimes.includes(file.mimetype)) return cb(null, true);
  cb(new Error("Invalid file type"));
};

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter,
});

// docs upload
const docsStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "./uploads/docs";
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const docsFileFilter = (req, file, cb) => {
  // const allowedExt = /xlsx|xls|csv|pdf|doc|docx|txt|jpg|jpeg|png|gif/;
  // const ext = allowedExt.test(path.extname(file.originalname).toLowerCase());

  // if (ext && allowedMimes.includes(file.mimetype)) return cb(null, true);
  // cb(new Error("Invalid file type"));
  if (allowedMimes.includes(file.mimetype)) return cb(null, true);
  cb(new Error("Invalid file type"));
};

export const docsUpload = multer({
  storage: docsStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: docsFileFilter,
});
