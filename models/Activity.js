const mongoose = require("mongoose");
const CloudinaryImageSchema = require("./Image");
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

    // Parent Destination
    destinationId: {
      //
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
      default: "USD",
    },
    duration: {
      type: String,
      required: [true, "The duration of the activity is required."],
    },

    // Capacity
    maxParticipants: {
      type: Number,
    },
    minimumAge: {
      type: String,
    },

    // Media
    image: {
      type: CloudinaryImageSchema,
      required: [true, "A cover image is required."],
    },
    gallery: [CloudinaryImageSchema],

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
    requirements: [String],
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
    status: {
      type: String,
      enum: ["published", "draft", "archived"],
      default: "published",
    },
    featured: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Activity", ActivitySchema);
