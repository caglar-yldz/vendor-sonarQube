const asyncHandler = require("express-async-handler");
const Effort = require("../models/effortModel");
const Project = require("../models/projectModel");
const Contract = require("../models/contractModel");
const User = require("../models/userModel");
const Company = require("../models/companyModel");
const Paginate = require("../pagination/pagination");
const paginatedResults = require("../pagination/pagination");
const EffortModel = require("../models/effortModel");

//@dec Create a new effort
//@route Post /api/effort/createEffort
//@access public
/*const createEffort = asyncHandler(async (req, res) => {
  var { projectId, workHours, description, hourFormat } = req.body;

  if (workHours == null || description == null) {
    res.status(400).json({
      message: "workHours and description are required",
    });
  }
  var user1;
  if (req.user.role == "admin") user1 = Company;
  else user1 = User;

  try {
    const user = await user1.findById(req.user.id);
    const project = await Project.findById(projectId);
    if (!user || !project) {
      res.status(404).json({
        message: "User or Project not found",
      });
    } else {
      const effort = await Effort.create({
        projectId,
        userName: user.userName || user.companyName,
        workHours,
        description,
        hourFormat,
        vendorId: req.user.id,
      });
      user.effortIds.push(effort._id);
      project.effortIds.push(effort._id);
      user.save();
      project.save();
      res.status(201).json({
        message: "Effort created successfully",
        effort,
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "Effort creation failed",
    });
  }
});*/

//@dec Create a new effort
//@route Post /api/effort/createEffort
//@access public
const createEffort = asyncHandler(async (req, res) => {
  var { projectId, month, description, day } = req.body;

  if (month == null || day == null || description == null) {
    res.status(400).json({
      message: "month, day and description are required",
    });
  }
  var user1;
  if (req.user.role == "admin") user1 = Company;
  else user1 = User;
  try {
    const user = await user1.findById(req.user.id);
    console.log(user);
    const project = await Project.findById(projectId);
    if (!user || !project) {
      res.status(404).json({
        message: "User or Project not found",
      });
    } else {
      const effort = await Effort.create({
        projectId,
        userName: (user.firstName+" "+user.lastName) || user.companyName,
        day,
        description,
        month,
        vendorId: req.user.id,
      });
      user.effortIds.push(effort._id);
      project.effortIds.push(effort._id);
      user.save();
      project.save();
      res.status(201).json({
        message: "Effort created successfully",
        effort,
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "Effort creation failed",
    });
  }
});

//@dec update  effort
//@route Post /api/effort/updateEffort/:id (effortid)
//@route Post /api/effort/updateEffort/:id (effortid)
//@access public
const updateEffort = asyncHandler(async (req, res) => {
  const effortId = req.params.id;
  const Updates = req.body;
  console.log("Update", Updates);
  if (Updates == null) {
    res.status(400).json({
      message: "No updates provided",
    });
  }
  try {
    const effort = await Effort.findByIdAndUpdate(effortId, Updates, {
      new: true,
    });
    if (!effort) {
      res.status(404).json({
        message: "Effort not found",
      });
    } else {
      res.status(200).json({
        message: "Effort updated successfully",
        effort,
      });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "effort update failed. Please try again." });
  }
});

//@dec get projects efforts
//@route Post /api/effort/getEffort
//@access public
const getEfforts = asyncHandler(async (req, res) => {
  const projectId = req.params.id;
  try {
    const project = await Project.findById(projectId);
    if (!project) {
      res.status(404).json({
        message: "Project not found",
      });
    } else {
      var populatedprojects = await project.populate("effortIds");
      const efforts = populatedprojects.effortIds.map((effort) => ({
        userName: effort.userName,
        effortId: effort._id,
        description: effort.description,
        workHours: effort.workHours,
        effortConfirmation: effort.effortConfirmation,
        effortComments: effort.effortComments,
        createdAt: effort.createdAt,
        hourFormat: effort.hourFormat,
        vendorId: effort.vendorId,
        date: effort.date,
        month: effort.month,
        year: effort.year,
        dayCount: effort.dayCount,
      }));
      const paginatedEfforts = res.paginatedResults;
      res.status(200).json({
        message: "Efforts found successfully",
        project: efforts,
      });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "effort update failed. Please try again." });
  }
});

//@dec add comments to efforts
//@route Post /api/effort/addComment
//@access public
const addComment = asyncHandler(async (req, res) => {
  const { effortId, comment, date } = req.body;
  const user = req.user.id;
  var usr;
  var userName;
  if (req.user.role == "admin") {
    usr = Company;
  } else {
    usr = User;
  }
  const user1 = await usr.findById(user);
  try {
    const effort = await Effort.findById(effortId);
    if (!effort) {
      return res.status(404).json({ message: "Effort not found" });
    } else if (comment == null) {
      return res.status(400).json({ message: "Comment is required" });
    }

    userName = user1.companyName || user1.userName;
    effort.effortComments.push({ comment, user: userName, date });
    const updatedEffort = await effort.save();
    res.status(200).json({
      message: "Comment added successfully",
      effort: updatedEffort,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Comment addition failed. Please try again." });
  }
});

//@dec get comments
//@route Post /api/effort/getComments/:id
//@access public
const getComments = asyncHandler(async (req, res) => {
  const id = req.params.id;
  try {
    const effort = await Effort.findById(id);
    if (!effort) {
      res.status(404).json({
        message: "effort not found",
      });
    } else {
      const comments = effort.effortComments;
      res.status(200).json({
        message: "comments found successfully",
        comments,
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "comments retrieval failed. Please try again.",
    });
  }
});

//@dec approve effort
//@route Put /api/effort/approve
//@access public
const approveEffort = asyncHandler(async (req, res) => {
  const { effortId, newStatus } = req.body;
  try {
    console.log(`newStatus: ${newStatus}`); // Log the value of newStatus
    const effort = await Effort.findById(effortId);
    if (!effort) {
      res.status(404).json({ message: "Effort not found" });
      return;
    }

    if (!["approved", "rejected"].includes(newStatus)) {
      res
        .status(400)
        .json('Invalid status. Status must be "approved" or "rejected" ');
      return;
    }

    effort.effortConfirmation = newStatus;
    await effort.save();

    if (newStatus === 'approved') {
      await calculateVendorPayments(effortId);
    }

    res.status(200).json({
      message: `Effort confirmation status updated to ${newStatus}`,
      effort: effort,
    });
  } catch (error) {
    console.error(error); // Log the error
    res.status(500).json({
      message: "Effort confirmation status update failed. Please try again.",
      message: error
    });
  }
});

const getVendorsAllEfforts = asyncHandler(async (req, res) => {
  console.log(req.user.id);
  const user = await User.findById(req.user.id);

  Effort.find()
    .where({ vendorId: req.user.id })
    .select(
      "projectId hourFormat description effortConfirmation effortComments createdAt date workHours month dayCount year"
    )
    .then((efforts) => {
      res.status(200).json(efforts);
    });
});

//@dec Create a new effort
//@route Post /api/effort/SİNGLEcreateEffort
//@access public
const singlecreateEffort = asyncHandler(async (req, res) => {
  const { projectId, description, dayCount, month, year } = req.body;
  if (!description || !dayCount || !month || !year) {
    return res.status(400).json({
      message: "hour, minute, description, and date are required",
    });
  }

  const user1 = req.user.role === "admin" ? Company : User;

  try {
    const user = await user1.findById(req.user.id);
    const project = await Project.findById(projectId);

    if (!user || !project) {
      return res.status(404).json({
        message: "User or Project not found",
      });
    }

    const effort = await EffortModel.create({
      projectId,
      userName: user.firstName + " " + user.lastName,
      description,
      month: month,
      year: year,
      dayCount: Number(dayCount),
      vendorId: req.user.id,
      workHours: Number(dayCount)*8
    });


    user.effortIds.push(effort._id);
    project.effortIds.push(effort._id);
    await user.save();
    await project.save();

    res.status(201).json({
      message: "Effort created successfully",
      effort,
    });
    // } else {
    //   res
    //     .status(400)
    //     .json("No more than 8 hours of effort can be made in one day");
    // }
  } catch (error) {
    res.status(500).json({
      message: "Effort creation failed",
    });
  }
});

const createMultipleEfforts = asyncHandler(async (req, res) => {
  const { projectId, startDate, endDate, description } = req.body;

  if (!projectId || !startDate || !endDate || !description) {
    return res.status(400).json({
      message: "Missing required fields",
    });
  }

  var user1;
  if (req.user.role == "admin") user1 = Company;
  else user1 = User;

  try {
    const user = await user1.findById(req.user.id);
    const project = await Project.findById(projectId);

    if (!user || !project) {
      return res.status(404).json({
        message: "User or Project not found",
      });
    }

    // Başlangıç ve bitiş tarihlerini uygun formata dönüştürme
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Başlangıç tarihinden başlayarak bitiş tarihine kadar her bir güne dönecek
    let currentDate = new Date(start);
    while (currentDate <= end) {
      // Check if there's already an effort for the vendor on the current date
      const existingEffort = await EffortModel.findOne({
        vendorId: req.user.id,
        date: currentDate,
      });

      // If no existing effort found, create a new one
      if (!existingEffort) {
        const effort = await EffortModel.create({
          projectId,
          userName: user.userName || user.companyName,
          description,
          date: currentDate,
          vendorId: req.user.id,
        });

        user.effortIds.push(effort._id);
        project.effortIds.push(effort._id);
      }

      currentDate.setDate(currentDate.getDate() + 1); // Bir sonraki güne geç
    }

    await user.save();
    await project.save();

    res.status(201).json({
      message: "Efforts created successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Effort creation failed",
    });
  }
});



const calculateVendorPayments = async (effortId) => {
  try {
    const effort = await Effort.findById(effortId).populate('vendorId');
    
    const contract = await Contract.findOne({ vendorId: effort.vendorId._id, projectId: effort.projectId, status: "approved"  });
    if (!contract) {
      throw new Error("Contract not found");
    }

    // Ensure dayCount and paymentRate are numbers
    const dayCount = Number(effort.dayCount);
    const paymentRate = Number(contract.paymentRate);

    if (isNaN(dayCount) || isNaN(paymentRate)) {
      throw new Error("Day count or payment rate is not a number");
    }

    const paymentAmount = dayCount * paymentRate;
    const paymentMonth = effort.month;

    // Create a date object for the first day of the payment month
    const paymentDate = new Date(new Date().getFullYear(), paymentMonth - 1, 1);

    // Find the contract and the specific paymentDate
    const contractToUpdate = await Contract.findOne(
      { 
        _id: contract._id,
        paymentDates: { $elemMatch: { startDate: { $gte: paymentDate } } }
      }
    );

    // If paymentAmount doesn't exist or is NaN, initialize it to 0
    const paymentDateToUpdate = contractToUpdate.paymentDates.find(pd => pd.startDate && pd.startDate.getTime() === paymentDate.getTime());
    if (paymentDateToUpdate && (!paymentDateToUpdate.paymentAmount || isNaN(paymentDateToUpdate.paymentAmount))) {
      paymentDateToUpdate.paymentAmount = 0;
    }

    // Save the updated contract
    await contractToUpdate.save();

    // Now increment the paymentAmount
    const updatedContract = await Contract.findOneAndUpdate(
      { 
        _id: contract._id,
        paymentDates: { $elemMatch: { startDate: { $gte: paymentDate } } }
      },
      { $inc: { 'paymentDates.$.paymentAmount': paymentAmount } },
      { new: true }
    );

    if (!updatedContract) {
      throw new Error("Contract not found or payment date for the effort month not found in contract");
    }
  } catch (error) {
    console.error(error.toString());
  }
};



module.exports = {
  createEffort,
  updateEffort,
  getEfforts,
  addComment,
  getComments,
  approveEffort,
  getVendorsAllEfforts,
  singlecreateEffort,
  createMultipleEfforts,
};
