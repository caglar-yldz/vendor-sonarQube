const mongoose = require("mongoose");

const projectSchema = mongoose.Schema(
  {
    projectName: {
      type: String,
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: [true, "Please enter a valid company ID"],
    },
    vendorIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    reports:[{
        type: Array
    }],
    effortIds:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Effort'
    }],
    projectManagerId:{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
  }
},
{
    timestamps: true,
  }
);

module.exports = mongoose.model("Project", projectSchema);
