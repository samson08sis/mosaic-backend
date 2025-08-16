const Destination = require("../models/Destination");

const mockDestinations = [
  {
    name: "Lalibela",
    image: "https://example.com/images/lalibela.jpg",
    description:
      "Famous for its 12th-century rock-hewn churches and religious heritage.",
    rating: 4.8,
    reviews: 242,
    activities: ["Trekking", "Swimming", "Cusine"],
  },
  {
    name: "Simien Mountains National Park",
    image: "https://example.com/images/simien.jpg",
    description:
      "A UNESCO World Heritage Site with breathtaking views and endemic wildlife.",
    rating: 4.7,
    reviews: 198,
    activities: ["Trekking", "Swimming", "Cusine"],
  },
  {
    name: "Lake Tana & Blue Nile Falls",
    image: "https://example.com/images/laketana.jpg",
    description:
      "Ethiopia’s largest lake with boat tours and the stunning Blue Nile Falls nearby.",
    rating: 4.6,
    reviews: 175,
    activities: ["Trekking", "Swimming", "Cusine"],
  },
  {
    name: "Addis Ababa",
    image: "https://example.com/images/addisababa.jpg",
    description:
      "The vibrant capital city featuring museums, food tours, and cultural sites.",
    rating: 4.5,
    reviews: 311,
    activities: ["Trekking", "Swimming", "Cusine"],
  },
];

exports.getAllDestinations = async (req, res) => {
  try {
    const allDestinations = await Destination.find().populate("activities");
    res.status(200).json(allDestinations);
  } catch (err) {
    console.log("Error fetching destinations:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getPopularDestinations = async (req, res) => {
  try {
    // { isPopular: true } // add later to => find()
    const popularDestinations = await Destination.find()
      .sort({ rating: -1 })
      .limit(4)
      .select("-description");
    // .populate("activities"); // Not yet a document.
    res.status(200).json(popularDestinations);
  } catch (err) {
    console.log("Error fetching destinations:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

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
