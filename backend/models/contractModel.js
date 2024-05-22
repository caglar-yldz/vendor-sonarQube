const mongoose = require("mongoose");

const contractSchema = mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
    },
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    vendorName: {
      type: String,
    },
    contractName: {
      type: String,
    },
    projectName: {
      type: String,
    },
    companyName: {
      type: String,
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
    },
    taxResidence: {
      type: Object,
    },
    job: {
      type: String,
    },
    jobTitle: {
      type: String,
    },
    seniorityLevel: {
      type: String,
    },
    jobDescription: {
      type: String,
    },
    currency: {
      type: String,
    },
    paymentRate: {
      type: Number,
    },
    startDate: {
      type: Date,
    },
    billDate: {
      type: Date,
    },
    validThroughDate: {
      type: Date,
    },
    paymentDates: {
      type: Object,
    },
    isSend: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["approved", "rejected", "pending"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Contract", contractSchema);
