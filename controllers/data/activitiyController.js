const Activity = require("../../models/Activity");

// Middleware/Helper (Simulates Admin role protection)
const protect = (req, res, next) => {
  req.user = { id: "admin-user-id" }; // Mock user
  next();
};

/**
 * @desc Get all Activities, optionally filtered/paginated
 * @route GET /api/activities
 * @access Public
 */
exports.getAllActivities = async (req, res) => {
  try {
    // Build query
    const queryObj = { ...req.query };
    const excludedFields = ["page", "sort", "limit", "fields"];
    excludedFields.forEach((el) => delete queryObj[el]);
    console.log("Excluded Fields: ", excludedFields);

    // Advanced filtering
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    let query = Activity.find(JSON.parse(queryStr));

    // Sorting
    if (req.query.sort) {
      const sortBy = req.query.sort.split(",").join(" ");
      query = query.sort(sortBy);
    } else {
      query = query.sort("-featured -ratings -createdAt");
    }

    // Field limiting
    if (req.query.fields) {
      const fields = req.query.fields.split(",").join(" ");
      query = query.select(fields);
    } else {
      query = query.select("-__v");
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    // query = query.skip(skip).limit(limit);

    // Execute query
    const activities = await query;
    const total = await Activity.countDocuments(JSON.parse(queryStr));

    res.status(200).json({
      status: "success",
      results: activities.length,
      data: { activities },
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.log("Error fetching activity:", err.message);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch activities",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

/**
 * @desc Create a new Activity
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
