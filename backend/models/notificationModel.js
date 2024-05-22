const mongoose = require("mongoose");
const User  =require('./userModel');

const notificationSchema = mongoose.Schema(
  {
    title: {
      type: String,
    },
    description: {
      type: String,
    },
    props:{
      type: Object,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    relatedObjectId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    relatedObjectUrl: {
        type: String,
    },
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: User,
    },
    companyId:{
      type: mongoose.Schema.Types.ObjectId,
      ref: User,
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Notification", notificationSchema);
