const asyncHandler = require("express-async-handler");
const Company = require("../models/companyModel");
const User = require("../models/userModel");
const Project = require("../models/projectModel");

//@dec Get all users
//@route GET /api/company/users
//@access private
const getUser = asyncHandler(async (req, res) => {
  var companyId = req.user.id
  if (req.user.role == "project_manager") {
    await User.findById(req.user.id).then((user) => {
      companyId = user.companyId;
    })
  }
  Company.findOne({ _id: companyId })
    .populate("vendorIds")
    .then((company) => {
      users = company.vendorIds.map((vendor) => ({
        _id: vendor._id,
        userName: vendor.userName,
        email: vendor.email,
        role: vendor.role,
        dailySalary: vendor.dailySalary,
        effortIds: vendor.effortIds,
        firstName: vendor.firstName,
        lastName: vendor.lastName,
        phoneNumber: vendor.phoneNumber,
        prefferedContact: vendor.prefferedContact,
        projectIds: vendor.projectIds
      }));
      res.status(200).json(users);
    })
    .catch((error) => {
      res.status(404).json({ users: "Empty" });
    });
});

const getUserById = asyncHandler(async (req, res) => {
  
  User.findById(req.params.id)
  .populate("effortIds")
  .then((user) => {
    res.status(200).json(user)
  })
  .catch((error) => {
    res.status(404).json("Vendor is not exist");
  })

})

//@dec Post user accept
//@route POST /api/company/accept
//@access private
const companyAccept = asyncHandler(async (req, res) => {
  const { email, companyName } = req.body;
  try {
    const user = await User.findOne({ email });
    const company = await Company.findOne({ companyName });
    const isempty = await Company.find({ vendorIds: { $in: [user._id] } }).where({ _id: company._id });
    if (!user || !company || !isempty.length == 0) {
      res.status(404).json({
        message: "User or Company not found or user already in a company"
      });
    } else {
      company.vendorIds.push(user._id);
      user.companyId = company._id;
      await company.save();
      await user.save();
      res.status(200).json({
        message: "Company updated"
      });

    }
  } catch (error) {
    res.status(400).json({
      message: "Company accept failed"
    });
  }
});

//@dec Delete user
//@route DELETE /api/company/users/:id
//@access private
const deleteUser = asyncHandler(async (req, res) => {
  Company.findOne({ _id: req.user.id })
    .populate("projectIds")
    .populate("vendorIds")
    .then((company) => {
      vendor = company.vendorIds.find((vendor) => vendor._id == req.params.id);
      if (!vendor) return res.status(404).json("Vendor not found");

      company.vendorIds = company.vendorIds.filter(
        (vendor) => vendor._id != req.params.id
      );
      company.save();

      Project.updateMany(
        { _id: vendor.projectIds },
        { $pull: { vendorIds: req.params.id } }
      ).then();

      User.deleteOne({ _id: req.params.id })
        .then((user) => {
          res.status(200).json({
            userName: user.userName,
            message: "Vendor deleted successfully!",
          });
        })
        .catch((error) => {
          res.status(400).json("Vendor could not be deleted");
        });
    })
    .catch((error) => {
      res.status(400).json("something went wrong");
    });
});

const updateUser = asyncHandler(async (req, res) => {
  const {dailySalary} = req.body;
  User.findOne({ _id: req.params.id })
  .then((user) => {

    user.dailySalary = dailySalary;
    user.save();

    res.status(200).json({
      message: "User updated successfully!",
    });
  })
  .catch((error) => {
     res.status(400).json("Vendor is not exist");
   });      
});

module.exports = { getUser, companyAccept, deleteUser, updateUser, getUserById };
