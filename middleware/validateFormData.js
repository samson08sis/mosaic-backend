const { validationResult, body } = require("express-validator");

// Validation rules for destination creation
exports.validateDestination = [
  // Basic Information
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Destination name is required")
    .isLength({ max: 100 })
    .withMessage("Name cannot exceed 100 characters"),

  body("summary")
    .trim()
    .notEmpty()
    .withMessage("Summary is required")
    .isLength({ max: 250 })
    .withMessage("Summary cannot exceed 250 characters"),

  body("description")
    .isArray({ min: 1 })
    .withMessage("At least one description paragraph is required")
    .custom((desc) => desc.some((d) => d.trim().length > 0))
    .withMessage("At least one non-empty description is required"),

  // Location
  body("country").trim().notEmpty().withMessage("Country is required"),

  body("city").trim().notEmpty().withMessage("City is required"),

  body("region").trim().notEmpty().withMessage("Region is required"),

  // Category
  body("category")
    .isIn(["Historical", "Nature", "Culture", "Religious", "City"])
    .withMessage("Invalid category"),

  // Image validation
  body("image")
    .custom((image) => {
      if (!image) return false;
      if (typeof image === "string") {
        return true; // Allow string URLs for now
      }
      return image.url && image.publicId;
    })
    .withMessage("Valid main image is required"),

  // Gallery validation
  body("gallery")
    .optional()
    .isArray()
    .withMessage("Gallery must be an array")
    .custom((gallery) => {
      if (!gallery) return true;
      return gallery.every(
        (img) => typeof img === "string" || (img.url && img.publicId)
      );
    })
    .withMessage("Each gallery image must have url and publicId"),

  // Coordinates validation
  body("coordinates")
    .optional()
    .custom((coords) => {
      if (!coords) return true;
      const { latitude, longitude } = coords;
      return (
        typeof latitude === "number" &&
        typeof longitude === "number" &&
        latitude >= -90 &&
        latitude <= 90 &&
        longitude >= -180 &&
        longitude <= 180
      );
    })
    .withMessage("Invalid coordinates format"),

  // Arrays validation
  body("highlights")
    .isArray({ min: 1 })
    .withMessage("At least one highlight is required")
    .custom((highlights) => highlights.some((h) => h.trim().length > 0))
    .withMessage("At least one non-empty highlight is required"),

  body("thingsToDo")
    .isArray({ min: 1 })
    .withMessage("At least one activity is required")
    .custom((things) => things.some((t) => t.trim().length > 0))
    .withMessage("At least one non-empty activity is required"),

  // Tags validation
  body("tags")
    .optional()
    .isArray()
    .withMessage("Tags must be an array")
    .custom((tags) =>
      tags.every((tag) => typeof tag === "string" && tag.trim().length > 0)
    )
    .withMessage("All tags must be non-empty strings"),

  // Validation result handler
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: "error",
        message: "Validation failed",
        errors: errors.array().map((err) => ({
          field: err.path,
          message: err.msg,
        })),
      });
    }
    next();
  },
];
