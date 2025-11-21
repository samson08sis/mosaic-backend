const Destination = require("../../models/Destination");

// Middleware/Helper (Simulates Admin protection)
const protect = (req, res, next) => {
  // In a real app: check if user is logged in and has 'admin' role.
  req.user = { id: "admin-user-id" }; // Mock user
  next();
};

// // All or popular destinations
// exports.getAllDestinations = async (req, res) => {
//   try {
//     const { popular } = req.query;

//     let destinations;
//     if (popular === "true") {
//       destinations = await Destination.find()
//         .sort({ rating: -1, createdAt: -1 })
//         .limit(4)
//         .populate("activities")
//         .lean();
//     } else {
//       destinations = await Destination.find().populate("activities");
//     }

//     res.status(200).json(destinations);
//   } catch (err) {
//     console.log("Error fetching destinations:", err.message);
//     res.status(500).json({ error: "Internal server error" });
//   }
// };

/**
 * @desc Get all Destinations, optionally filtered/paginated
 * @route GET /api/destinations
 * @access Public
 */
exports.getAllDestinations = async (req, res) => {
  try {
    // Build query
    const queryObj = { ...req.query };
    const excludedFields = ["page", "sort", "limit", "fields"];
    excludedFields.forEach((el) => delete queryObj[el]);
    console.log("Excluded Fields: ", excludedFields);

    // Advanced filtering
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    let query = Destination.find(JSON.parse(queryStr)).populate("activities");

    // Sorting
    if (req.query.sort) {
      const sortBy = req.query.sort.split(",").join(" ");
      query = query.sort(sortBy);
    } else {
      query = query.sort("-createdAt");
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

    query = query.skip(skip).limit(limit);

    // Execute query
    const destinations = await query;
    const total = await Destination.countDocuments(JSON.parse(queryStr));

    res.status(200).json({
      status: "success",
      results: destinations.length,
      data: { destinations },
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.log("Error fetching destination:", err.message);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch destinations",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

/**
 * @desc Get a single Destination by its unique slug
 * @route GET /api/destinations/:slug
 * @access Public
 */
exports.getDestinationBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const destination = await Destination.findOne({ slug }).populate(
      "activities"
    );

    if (!destination) {
      return res.status(404).json({
        status: "error",
        message: `No destination found with slug: ${slug}`,
      });
    }

    res.status(200).json({
      status: "success",
      data: { destination },
    });
  } catch (err) {
    console.error("Error fetching destination:", err.message);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch destination",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

/**
 * @desc Get a single Destination by id
 * @route GET /api/admin/destinations/:id
 * @access Restricted (Admin)
 */
exports.getDestinationById = async (req, res) => {
  try {
    const { id } = req.params;

    const destination = await Destination.findById(id).populate("activities");

    if (!destination) {
      return res.status(404).json({
        status: "error",
        message: "No destination found with the provided ID",
      });
    }

    res.status(200).json({
      status: "success",
      data: { destination },
    });
  } catch (err) {
    console.error("Error fetching destination:", err.message);

    if (err.name === "CastError") {
      return res.status(400).json({
        status: "error",
        message: "Invalid destination ID",
      });
    }

    res.status(500).json({
      status: "error",
      message: "Failed to fetch destination",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

/**
 * @desc Create a new Destination
 * @route POST /api/destinations/create
 * @access Restricted (Admin)
 */
exports.createDestination = async (req, res) => {
  try {
    // Autogenerate slug if not found
    if (!req.body.slug && req.body.name && req.body.country) {
      req.body.slug = req.body.name
        .concat(" ")
        .concat(req.body.country)
        .toLowerCase()
        .replace(/[^a-z0-9 -]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
    }

    const destination = await Destination.create(req.body);

    res.status(201).json({
      status: "success",
      data: { destination },
    });
  } catch (err) {
    console.error("Error creating destination:", err.message);

    if (err.code === 11000) {
      return res.status(400).json({
        status: "error",
        message: "Destination with this slug already exists",
      });
    }

    if (err.name === "ValidationError") {
      const errors = Object.values(err.errors).map((el) => el.message);
      return res.status(400).json({
        status: "error",
        message: "Invalid input data",
        errors,
      });
    }

    res.status(500).json({
      status: "error",
      message: "Failed to create destination",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

// TESTING CONTROLLERS

exports.createDestinations = async (req, res) => {
  try {
    await Destination.insertMany(mockDestinations);
    res.sendStatus(201);
  } catch (err) {
    console.log("Error creating destinations:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.deleteAllDestinations = async (req, res) => {
  try {
    const deleteResponse = await Destination.deleteMany();
    res.status(200).json(deleteResponse);
  } catch (err) {
    console.log("Error deleting all destinations:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
