const Destination = require("../models/Destination");

const mockDestinations = [
  {
    name: "Lalibela, Ethiopia",
    image: "/lalibela-bete-giorgis.jpg",

    description:
      "Home to 11 medieval monolithic rock-hewn churches, Lalibela is Ethiopia's Jerusalem and a place of pilgrimage for Orthodox Christians.",
    rating: 4.9,
    reviews: 245,
    activities: ["Cultural", "Historical", "Religious"],
  },
  {
    name: "Simien Mountains, Ethiopia",
    image: "/bg-2.jpg",
    description:
      "A UNESCO World Heritage site with dramatic mountain scenery, deep valleys, and rare wildlife including the Gelada baboon and Walia ibex.",
    rating: 4.8,
    reviews: 187,
    activities: ["Trekking", "Wildlife", "Nature"],
  },
  {
    name: "Lake Tana & Blue Nile Falls",
    image: "/nile-2.jpg",
    description:
      "Ethiopia’s largest lake with boat tours and the stunning Blue Nile Falls nearby.",
    rating: 4.6,
    reviews: 175,
    activities: ["Trekking", "Swimming", "Adventure"],
  },
  {
    name: "Addis Ababa, Ethiopia",
    image: "/bg-69.jpg",
    description:
      "Ethiopia's vibrant capital and diplomatic hub with museums, markets, and restaurants showcasing the country's rich history and diverse cuisine.",
    rating: 4.4,
    reviews: 210,
    activities: ["Urban", "Cultural", "Culinary"],
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
