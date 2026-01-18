const cloudinary = require('../config/cloudinary');
const fs = require('fs').promises;

const uploadImage = async (req, res) => {
  try {
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'menucloud',
    });
    await fs.unlink(req.file.path); // Clean up the temporary file
    res.json({ url: result.secure_url });
  } catch (error) {
    res.status(500).json({ message: 'Error uploading image', error });
  }
};

module.exports = { uploadImage };
