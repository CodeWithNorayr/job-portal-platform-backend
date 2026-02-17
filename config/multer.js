import multer from "multer";
import path from "path";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";

/* ===============================
   ✅ Cloudinary Config
================================= */
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

/* ===============================
   ✅ Sanitize filenames
================================= */
const sanitizeFileName = (name) => {
  return name.replace(/\s+/g, "_").replace(/[^\w\-]/g, "");
};

/* ===============================
   ✅ Unified Storage System
================================= */
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    let folder = "general";

    /* ---------- IMAGES ---------- */
    if (file.mimetype.startsWith("image/")) {
      if (req.baseUrl.includes("jobs")) folder = "jobs/images";
      else if (req.baseUrl.includes("recruiters")) folder = "recruiters/images";
      else if (req.baseUrl.includes("users")) folder = "users/images";
      else folder = "general/images";

      return {
        folder,
        resource_type: "image",
        public_id: `${Date.now()}-${sanitizeFileName(path.parse(file.originalname).name)}`,
      };
    }

    /* ---------- RESUMES ---------- */
    const allowedDocs = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (allowedDocs.includes(file.mimetype)) {
      folder = "users/resumes";
      return {
        folder,
        resource_type: "raw",
        public_id: `${Date.now()}-${sanitizeFileName(path.parse(file.originalname).name)}`,
      };
    }

    throw new Error("Unsupported file type! Only images or documents are allowed.");
  },
});

/* ===============================
   ✅ Multer Upload Middleware
================================= */
const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedImages = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
    const allowedDocs = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (allowedImages.includes(file.mimetype) || allowedDocs.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only .png, .jpg, .jpeg, .webp images or PDF/Word documents are allowed"));
    }
  },
});

export default upload;
