const mongoose = require("mongoose");

const ImageSchema = new mongoose.Schema({
  url: { type: String, required: true },
  alt: { type: String, default: "Destination Image" },
  public_id: { type: String, required: true },
});

const DestinationSchema = new mongoose.Schema(
  {
    // Core Identification and Routing
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: [100, "A destination name cannot exceed 100 characters."],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },

    // Content and Descriptions
    summary: {
      type: String,
      required: [true, "A destination must have a summary."],
      trim: true,
      maxlength: [250, "The summary cannot exceed 250 characters."],
    },
    description: {
      type: [String],
      required: [true, "A destination must have a full description."],
    },

    // Media
    image: {
      // type: ImageSchema,
      type: String, // For now. We'll later save to cloudinary and save the url and public id.
      required: [true, "A main image URL is required."],
    },
    gallery: { type: [String], required: true },

    // Location Data
    country: {
      type: String,
      required: [true, "Country is required."],
      default: "Ethiopia",
    },
    city: {
      type: String,
      required: [true, "Nearest city is required."],
      trim: true,
    },
    region: {
      type: String,
      required: [true, "Region is required."],
    },
    mapEmbed: String,
    coordinates: { type: { latitude: String, longitude: String } },

    // Categorization and Filtering
    category: {
      type: String,
      required: [true, "A category is required for filtering."],
      enum: ["Historical", "Nature", "Culture", "Religious", "City"],
      index: true,
    },
    tags: [String],

    // Utility
    bestTimeToVisit: {
      type: String,
    },
    bestTimeReason: String,
    highlights: {
      type: [String],
      default: [],
    },
    thingsToDo: {
      type: [String],
      default: [],
    },
    // popularActivities: [String],

    // Review Statistics
    ratings: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
      max: 5,
      set: (val) => Math.round(val * 10) / 10, // 1 decimal place
    },
    reviews: {
      type: Number,
      default: 0,
    },

    // Additional Info
    culturalSignificance: String,
    historicalImportance: String,
    naturalFeatures: String,
  },
  { timestamps: true }
);

// Virtual Populate: Link Destinations to Activities (but not store the IDs in the DB)
DestinationSchema.virtual("activities", {
  ref: "Activity",
  localField: "_id",
  foreignField: "destinationId",
});

DestinationSchema.methods.getMinimalData = function () {
  return {
    id: this._id,
    slug: this.slug,
    name: this.name,
    image: this.image,
    rating: this.rating,
    reviews: this.reviews,
    category: this.category,
    activities: this.activities,
  };
};

module.exports = mongoose.model("Destination", DestinationSchema);
