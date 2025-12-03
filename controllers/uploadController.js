const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * @desc Upload image to Cloudinary
 * @route POST /api/upload
 * @access Restricted (Admin)
 */
exports.uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        status: "error",
        message: "No image file provided",
      });
    }

    // Validate file type
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/gif",
    ];
    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed",
      });
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (req.file.size > maxSize) {
      return res.status(400).json({
        status: "error",
        message: "File size too large. Maximum size is 5MB",
      });
    }

    // Upload to Cloudinary using stream
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "destinations",
          resource_type: "image",
          transformation: [
            { width: 1200, height: 800, crop: "limit" }, // Optimized for display
            { quality: "auto" },
            { fetch_format: "auto" },
          ],
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
    });

    res.json({
      status: "success",
      data: {
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        width: uploadResult.width,
        height: uploadResult.height,
        format: uploadResult.format,
      },
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to upload image",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * @desc Delete image from Cloudinary
 * @route DELETE /api/upload/:publicId
 * @access Restricted (Admin)
 */
exports.deleteImage = async (req, res) => {
  try {
    const { publicId } = req.params;

    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result === "ok") {
      res.json({
        status: "success",
        message: "Image deleted successfully",
      });
    } else {
      res.status(404).json({
        status: "error",
        message: "Image not found or already deleted",
      });
    }
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to delete image",
    });
  }
};
