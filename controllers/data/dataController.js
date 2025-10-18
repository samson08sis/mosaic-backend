const HeroImages = require("../../models/HeroImages");

exports.getClientSlides = async (req, res) => {
  try {
    const slides = await HeroImages.find(
      { isActive: true },
      { _id: 0, isActive: 0, __v: 0 }
    );
    res.status(200).json({ success: true, data: slides });
  } catch (err) {
    console.log("Error fetching hero slides: ", err.message);
  }
};

exports.getHeroImages = async (req, res) => {
  try {
    const data = await HeroImages.find({});
    res.status(200).json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createHeroImage = async (req, res) => {
  try {
    const payload = req.body;

    // If it's an array, insert many
    if (Array.isArray(payload)) {
      const createdSlides = await HeroImages.insertMany(payload);
      return res.status(201).json({ success: true, data: createdSlides });
    }

    // Otherwise, insert one
    const createdSlide = await HeroImages.create(payload);
    return res.status(201).json({ success: true, data: createdSlide });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createHeroImages = async (req, res) => {
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

exports.updateHeroImage = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const updatedSlide = await HeroImages.findByIdAndUpdate(id, updates, {
      new: true, // return the updated document
      runValidators: true, // ensure schema validation
    });

    if (!updatedSlide) {
      return res
        .status(404)
        .json({ success: false, message: "Slide not found" });
    }

    res.status(200).json({ success: true, data: updatedSlide });
  } catch (err) {
    console.log(err.message);
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
