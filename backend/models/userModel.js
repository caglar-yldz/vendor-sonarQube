const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
  {
    userName: {
      type: String,
      required: [true, "Please enter a valid username"],
      unique: true,
    },
    email: {
      type: String,
      required: [true, "Please enter a valid email"],
      unique: true,
    },
    firstName: {
      type: String,
    },
    lastName: {
      type: String,
    },
    address:{
      type: Object,
    },
    about:{
      type: Object,
    },
    password: {
      type: String,
      required: [true, "Please enter a valid password"],
    },
    projectIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
      },
    ],
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
    },
    effortIds: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Effort'
    }],
    role: {
      type: String,
      enum: ["user", "admin", "project_manager"],
      default: "user",
    },
    dailySalary:{
      type: Number,
      default: 0
    },
    phoneNumber:{
      type: String,
      default: 0
    },
    prefferedContact:{
      type: [String],
      enum: ["phone","message","email","videoConference","faceToFaceMeeting"],
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

module.exports = mongoose.model("User", userSchema);
