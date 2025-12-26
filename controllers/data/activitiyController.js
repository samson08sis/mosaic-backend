const Activity = require("../../models/Activity");

// Middleware/Helper (Simulates Admin role protection)
const protect = (req, res, next) => {
  req.user = { id: "admin-user-id" }; // Mock user
  next();
};

/**
 * @desc Create a new Activity for a specific Destination
 * @route POST /api/activities/create
 * @access Restricted (Admin)
 */
exports.createActivity = [
  protect,
  async (req, res) => {
    try {
      const { name, status, ...rest } = req.body;

      // Validate required fields for publishing
      if (status === "published") {
        const requiredFields = [
          "name",
          // "summary",
          "description",
          "image",
          "category",
          "price",
        ];
        const missingFields = requiredFields.filter(
          (field) =>
            !req.body[field] ||
            (Array.isArray(req.body[field]) && req.body[field].length === 0)
        );

        if (missingFields.length > 0) {
          return res.status(400).json({
            status: "error",
            message: `Cannot publish activity. Missing required fields: ${missingFields.join(
              ", "
            )}`,
          });
        }
      }

      // Autogenerate slug
      let slug;
      if (name) {
        slug = `${name
          .toLowerCase()
          .replace(/[^a-z0-9 -]/g, "")
          .replace(/\s+/g, "-")
          .replace(/-+/g, "-")}`;
      }

      // Check for duplicate slug
      const existing = await Activity.findOne({ slug });
      if (existing) {
        return res.status(400).json({
          status: "error",
          message: "Activity with this slug already exists",
          suggestion: `${slug}-${Date.now().toString().slice(-4)}`,
        });
      }

      const activity = await Activity.create({
        ...rest,
        name,
        slug,
        status,
      });

      res.status(201).json({
        status: "success",
        activity,
        message:
          status === "draft"
            ? "Activity saved as draft successfully"
            : "Activity published successfully",
      });
    } catch (err) {
      console.error("Error creating activity:", err.message);

      if (err.code === 11000) {
        return res.status(400).json({
          status: "error",
          message: "Activity with this slug already exists",
          error: err.message,
        });
      }

      if (err.name === "ValidationError") {
        const errors = Object.values(err.errors).map((el) => ({
          field: el.path,
          message: el.message,
        }));
        return res.status(400).json({
          status: "error",
          message: "Validation failed",
          errors,
        });
      }

      res.status(500).json({
        status: "error",
        message: "Failed to create activity",
        error: process.env.NODE_ENV === "development" ? err.message : undefined,
      });
    }
  },
];

/**
 * @desc Get a single Activity by id
 * @route GET /api/activities/id/:id
 * @access Restricted (Admin)
 */
exports.getActivityById = async (req, res) => {
  try {
    const { id } = req.params;

    const activity = await Activity.findById(id);

    if (!activity) {
      return res.status(404).json({
        status: "error",
        message: "No activity found with the provided ID",
      });
    }

    res.status(200).json({
      status: "success",
      data: { activity },
    });
  } catch (err) {
    console.error("Error fetching activity:", err.message);

    if (err.name === "CastError") {
      return res.status(400).json({
        status: "error",
        message: "Invalid activity ID",
      });
    }

    res.status(500).json({
      status: "error",
      message: "Failed to fetch activity",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};
