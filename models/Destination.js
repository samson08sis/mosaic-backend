const mongoose = require("mongoose");
const { default: slugify } = require("slugify");

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
      type: String,
      required: [true, "A destination must have a full description."],
    },

    // Media
    image: {
      type: String,
      required: [true, "A main image URL is required."],
    },
    gallery: [String],

    // Location Data
    country: {
      type: String,
      required: [true, "Country is required."],
      default: "Ethiopia",
    },
    city: {
      type: String,
      trim: true,
    },
    region: String,
    mapEmbed: String,

    // Geospatial Data for location-based searching
    coordinates: {
      type: {
        type: String,
        default: "Point",
        enum: ["Point"], // GeoJSON type
      },
      geo: {
        type: [Number],
        required: [true, "Coordinates (longitude, latitude) are required."],
      },
    },

    // Categorization and Filtering
    category: {
      type: String,
      required: [true, "A category is required for filtering."],
      enum: ["Historical", "Nature", "Culture", "Religious", "City"], // Example Ethiopian categories
      index: true,
    },
    tags: [String],

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
  },
  { timestamps: true }
);

// Virtual Populate: Link Destinations to Activities (but not store the IDs in the DB)
DestinationSchema.virtual("activities", {
  ref: "Activity",
  localField: "_id",
  foreignField: "destinationId",
});

DestinationSchema.pre("save", async function (next) {
  if (!this.slug) {
    this.slug = slugify(this.name, { lower: true, strict: true, trim: true });
  }
  next();
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
