const HeroImages = require("../../models/HeroImages");

exports.getHeroImages = async (req, res) => {
  try {
    const data = await HeroImages.find({}, { _id: 0 });
    res.status(200).json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createHeroImage = async (req, res) => {
  try {
    const { images } = req.body;
    // Skippded auth for now...
    if (Array.isArray(images)) await HeroImages.insertMany(images);
    else await HeroImages.insertOne(images);
    res.sendStatus(201);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteAllHeroImages = async (req, res) => {
  try {
    await HeroImages.deleteMany();
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
