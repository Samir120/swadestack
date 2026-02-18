import multer from 'multer';
import path from 'path';
import fs from 'fs';

const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  },
});

const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];

const fileFilter = (req: any, file: any, cb: any) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (file.mimetype.startsWith('image/') && ALLOWED_EXTENSIONS.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (jpg, jpeg, png, gif, webp) are allowed!'), false);
  }
};

export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});
