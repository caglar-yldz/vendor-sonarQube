const mongoose = require("mongoose");

const effortSchema = mongoose.Schema(
  {
    userName: {
      type: String,
      required: [true, "Please enter a valid name."],
    },
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    description: {
      type: String,
      required: [true, "Please enter a valid description."],
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    effortComments: [
      {
        comment: {
          type: String,
        },
        user: {
          type: String,
        },
        date: {
          type: String,
        },
      },
    ],
    effortConfirmation: {
      type: String,
      enum: ["approved", "rejected", "pending"],
      default: "pending",
    },
    workHours: {
      type: String,
      default: "8",
    },
    hourFormat: {
      type: String,
    },
    date: {
      type: Date,
    },
    dayCount: {
      type: Number,
      required: true,
    },
    month: {
      type: Number,
      required: true,
    },
    year:{
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Effort", effortSchema);
