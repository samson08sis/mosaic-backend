const mongoose = require("mongoose");
const { Schema } = mongoose;

const ActivitySchema = new Schema(
  {
    // Core Identification and Routing
    name: {
      type: String,
      required: [true, "An activity must have a name."],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, "An activity must have a unique slug."],
      unique: true,
      lowercase: true,
      trim: true,
    },

    // Relationship to Parent Destination (Crucial Reference)
    destinationId: {
      type: mongoose.Schema.ObjectId,
      ref: "Destination",
      required: [true, "An activity must belong to a destination."],
      index: true, // *** Dramatically speeds up lookup by destination
    },

    // Content
    summary: {
      type: String,
      required: [true, "An activity must have a summary."],
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: [true, "An activity must have a full description."],
    },

    // Pricing and Duration
    price: {
      type: Number,
      required: [true, "An activity must have a base price."],
      min: [0, "Price must be a positive number."],
    },
    currency: {
      type: String,
      required: [true, "Currency is required."],
      default: "ETB", // Ethiopian Birr is the local currency
      enum: ["USD", "ETB", "EUR"],
    },
    duration: {
      type: String,
      required: [true, "The duration of the activity is required."],
    },

    // Media
    image: {
      type: String,
      required: [true, "A cover image URL is required."],
    },
    gallery: [String],

    // Categorization and Logistics
    category: {
      type: String,
      required: [true, "An activity category is required."],
      enum: [
        "Hiking",
        "Trekking",
        "Historical Tour",
        "Cultural Immersion",
        "Adventure",
        "Day Trip",
      ],
      index: true,
    },
    inclusions: [String],
    exclusions: [String],
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

    // Utility
    isPublished: {
      type: Boolean,
      default: false,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Activity", ActivitySchema);
