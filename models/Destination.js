const mongoose = require("mongoose");

const DestinationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    image: {
      type: String,
      required: true,
      // default: "..."
    },
    description: {
      type: String,
      required: true,
      // default: "..."
    },
    rating: {
      type: Number,
      required: true,
      default: 4.5,
    },
    reviews: {
      type: Number,
    },
    // activities: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "Activity",
    // },
    activities: [
      {
        type: String,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Destination", DestinationSchema);
