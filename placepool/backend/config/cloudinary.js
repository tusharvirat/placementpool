const cloudinary            = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer                = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const mime = file.mimetype || '';
    let resource_type = 'auto';
    if (mime.startsWith('video/'))          resource_type = 'video';
    else if (mime.startsWith('image/'))     resource_type = 'image';
    else if (mime === 'application/pdf')    resource_type = 'image'; // Cloudinary serves PDFs via image resource_type with .pdf extension — gives public URL
    else                                    resource_type = 'raw';   // raw = any other file type, gives direct download link

    // Clean filename
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');

    return {
      folder:        'placepool/resources',
      resource_type,
      public_id:     `${Date.now()}-${safeName}`,
      // For PDFs: use fl_attachment flag to force download instead of inline (avoids 401)
      // But actually we want inline — so we use image resource_type which gives direct https URL
    };
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100 MB
});

module.exports = { cloudinary, upload };
