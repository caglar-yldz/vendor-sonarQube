const mongoose = require("mongoose");

const companySchema = mongoose.Schema(
  {
    companyName: {
      type: String,
      required: [true, "Please enter a valid name"],
      unique: true,
    },
    email: {
      type: String,
      required: [true, "Please enter a valid email"],
      unique: true,
    },
    password: {
      type: String,
      required: [true, "Please enter a valid password"],
    },
    address:{
      type: Object,
    },
    about:{
      type: Object,
    },
    vendorIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    projectIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
      },
    ],
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "admin",
    },
    favoriteProjects:[
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
      },
    ],
    notifications:[
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Notification",
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Company", companySchema);
