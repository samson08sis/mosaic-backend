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

    // query = query.skip(skip).limit(limit);

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
 * @route GET /api/destinations/slug/:slug
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
 * @route GET /api/destinations/id/:id
 * @access Restricted (Admin)
 */
exports.getDestinationById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("ID: >>> ", id);

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
    const { name, country, status = "draft", ...rest } = req.body;

    // Validate required fields for publishing
    if (status === "published") {
      const requiredFields = [
        "name",
        "summary",
        "description",
        "image",
        "country",
        "city",
        "region",
        "category",
        "highlights",
        "thingsToDo",
      ];
      const missingFields = requiredFields.filter(
        (field) =>
          !req.body[field] ||
          (Array.isArray(req.body[field]) && req.body[field].length === 0)
      );

      if (missingFields.length > 0) {
        return res.status(400).json({
          status: "error",
          message: `Cannot publish destination. Missing required fields: ${missingFields.join(
            ", "
          )}`,
        });
      }
    }

    // Autogenerate slug
    let slug;
    if (!req.body.slug && name && country) {
      slug = `${name
        .toLowerCase()
        .replace(/[^a-z0-9 -]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")}-${country.toLowerCase()}`;
    } else {
      slug = req.body.slug;
    }

    // Check for duplicate slug
    const existing = await Destination.findOne({ slug });
    if (existing) {
      return res.status(400).json({
        status: "error",
        message: "Destination with this slug already exists",
        suggestion: `${slug}-${Date.now().toString().slice(-4)}`,
      });
    }

    // Prepare coordinates
    let coordinates;
    if (req.body.coordinates && typeof req.body.coordinates === "string") {
      const [lat, lon] = req.body.coordinates
        .split(",")
        .map((coord) => parseFloat(coord.trim()));
      if (!isNaN(lat) && !isNaN(lon)) {
        coordinates = { latitude: lat, longitude: lon };
      }
    } else if (
      req.body.coordinates &&
      req.body.coordinates.latitude &&
      req.body.coordinates.longitude
    ) {
      coordinates = req.body.coordinates;
    }

    // Create destination
    const destination = await Destination.create({
      ...rest,
      name,
      slug,
      coordinates,
      status,
      lastSavedAt: new Date(),
      ...(status === "published" && { publishedAt: new Date() }),
    });

    res.status(201).json({
      status: "success",
      destination,
      message:
        status === "draft"
          ? "Destination saved as draft successfully"
          : "Destination published successfully",
    });
  } catch (err) {
    console.error("Error creating destination:", err.message);

    if (err.code === 11000) {
      return res.status(400).json({
        status: "error",
        message: "Destination with this slug already exists",
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
      message: "Failed to create destination",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

/**
 * @desc Save destination as draft
 * @route PUT /api/destinations/:id/draft
 * @access Restricted (Admin)
 */
exports.saveAsDraft = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = {
      ...req.body,
      status: "draft",
      lastSavedAt: new Date(),
    };

    const destination = await Destination.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!destination) {
      return res.status(404).json({
        status: "error",
        message: "Destination not found",
      });
    }

    res.json({
      status: "success",
      data: { destination },
      message: "Draft saved successfully",
    });
  } catch (err) {
    console.error("Error saving draft:", err.message);
    res.status(500).json({
      status: "error",
      message: "Failed to save draft",
    });
  }
};

/**
 * @desc Publish a draft destination
 * @route PUT /api/destinations/:id/publish
 * @access Restricted (Admin)
 */
exports.publishDestination = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if destination has all required fields
    const destination = await Destination.findById(id);
    if (!destination) {
      return res.status(404).json({
        status: "error",
        message: "Destination not found",
      });
    }

    const requiredFields = [
      "name",
      "summary",
      "description",
      "image",
      "country",
      "city",
      "region",
      "category",
      "highlights",
      "thingsToDo",
    ];
    const missingFields = requiredFields.filter((field) => {
      const value = destination[field];
      return !value || (Array.isArray(value) && value.length === 0);
    });

    if (missingFields.length > 0) {
      return res.status(400).json({
        status: "error",
        message: `Cannot publish destination. Missing required fields: ${missingFields.join(
          ", "
        )}`,
      });
    }

    destination.status = "published";
    destination.publishedAt = new Date();
    await destination.save();

    res.json({
      status: "success",
      data: { destination },
      message: "Destination published successfully",
    });
  } catch (err) {
    console.error("Error publishing destination:", err.message);
    res.status(500).json({
      status: "error",
      message: "Failed to publish destination",
    });
  }
};

/**
 * @desc Update a Destination by ID
 * @route PUT /api/destinations/:id
 * @access Restricted (Admin)
 */
exports.updateDestination = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(id);
    // Generate slug from name if name is updated
    if (req.body.name && req.body.country && !req.body.slug) {
      req.body.slug = req.body.name
        .concat(" ")
        .concat(req.body.country)
        .toLowerCase()
        .replace(/[^a-z0-9 -]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
    }

    const destination = await Destination.findByIdAndUpdate(id, req.body, {
      new: true, // Return updated document
      runValidators: true,
    });

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
    console.error("Error updating destination:", err.message);

    if (err.name === "CastError") {
      return res.status(400).json({
        status: "error",
        message: "Invalid destination ID",
      });
    }

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
      message: "Failed to update destination",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

// TESTING CONTROLLERS

/**
 * @desc Delete a Destination by ID
 * @route DELETE /api/admin/destinations/:id
 * @access Restricted (Admin)
 */
exports.deleteDestination = async (req, res) => {
  try {
    const { secret } = req.body;
    const { id } = req.params;

    if (!secret || secret !== process.env.DELETE_REQUEST_SECRET)
      return res.sendStatus(400);

    const destination = await Destination.findByIdAndDelete(id);

    if (!destination) {
      return res.status(404).json({
        status: "error",
        message: "No destination found with the provided ID",
      });
    }

    res.status(204).json({
      status: "success",
      data: null,
    });
  } catch (err) {
    console.error("Error deleting destination:", err.message);

    if (err.name === "CastError") {
      return res.status(400).json({
        status: "error",
        message: "Invalid destination ID",
      });
    }

    res.status(500).json({
      status: "error",
      message: "Failed to delete destination",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
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
