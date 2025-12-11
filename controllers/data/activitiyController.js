const Activity = require("../../models/Activity");
const DeletedDocument = require("../../models/DeletedDocuments");

const mockActivities = [
  {
    name: "Simien Mountains Trek",
    description:
      "A breathtaking hike through Ethiopia’s UNESCO-listed Simien Mountains, home to gelada baboons and dramatic escarpments.",
    location: { city: "Debark" },
    category: "Adventure",
    images: [
      "https://example.com/images/simien1.jpg",
      "https://example.com/images/simien2.jpg",
    ],
    price: 120,
    duration: "full day",
    status: "available",
  },
  {
    name: "Lalibela Rock-Hewn Churches Tour",
    description:
      "Explore the iconic monolithic churches carved from rock in the 12th century, a spiritual and architectural marvel.",
    location: { city: "Lalibela" },
    category: "Cultural",
    images: ["https://example.com/images/lalibela1.jpg"],
    price: 80,
    duration: { hours: 4 },
    status: "available",
  },
  {
    name: "Lake Chamo Sunset Boat Ride",
    description:
      "Cruise across Lake Chamo in Arba Minch and spot crocodiles, hippos, and vibrant birdlife as the sun sets.",
    location: { city: "Arba Minch" },
    category: "Nature",
    images: [
      "https://example.com/images/chamo1.jpg",
      "https://example.com/images/chamo2.jpg",
    ],
    price: 60,
    duration: "2 hours",
    status: "available",
  },
  {
    name: "Coffee Ceremony Experience",
    description:
      "Participate in a traditional Ethiopian coffee ceremony, learning the rituals and tasting freshly roasted beans.",
    location: { city: "Addis Ababa" },
    category: "Cultural",
    images: ["https://example.com/images/coffee1.jpg"],
    price: 25,
    duration: "90 minutes",
    status: "available",
  },
  {
    name: "Danakil Depression Expedition",
    description:
      "Journey into one of the hottest and most alien landscapes on Earth, with sulfur springs and lava lakes.",
    location: { city: "Dallol" },
    category: "Adventure",
    images: ["https://example.com/images/danakil1.jpg"],
    price: 200,
    duration: "2 days",
    status: "unavailable",
  },
  {
    name: "Traditional Weaving Workshop",
    description:
      "Learn the art of hand-weaving from local artisans in Dorze village, using bamboo looms and colorful threads.",
    location: { city: "Chencha" },
    category: "Cultural",
    images: ["https://example.com/images/weaving1.jpg"],
    price: 35,
    duration: "half day",
    status: "available",
  },
];

// Middleware/Helper (Simulates Admin role protection)
const protect = (req, res, next) => {
  req.user = { id: "admin-user-id" }; // Mock user
  next();
};

/**
 * @desc Create a new Activity for a specific Destination
 * @route POST /api/destinations/:destinationId/activities
 * @access Restricted (Admin)
 */
exports.createActivity = [
  protect,
  async (req, res) => {
    try {
      const { name, destinationId, status, ...rest } = req.body;

      // Validate required fields for publishing
      if (status === "published") {
        const requiredFields = [
          "name",
          "summary",
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
 * @desc Create mock Activities for testing
 * @route POST /api/destinations/:destinationId/activities
 * @access Restricted (Admin)
 */
exports.createActivities = async (req, res) => {
  try {
    await Activity.insertMany(mockActivities);
    res.sendStatus(201);
  } catch (err) {
    console.log("Error creating activities:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
