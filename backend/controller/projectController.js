const asyncHandler = require("express-async-handler");
const Project = require("../models/projectModel");
const Company = require("../models/companyModel");
const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

//@dec Post create project
//@route POST /api/projects/new
//@access private
const createProject = asyncHandler(async (req, res) => {
  var { projectName, vendorIds, projectManagerId } = req.body;

  const vendorIdsArray = vendorIds.map((vendor) => vendor._id);

  console.log("project manager id: " + projectManagerId);
  if (!vendorIdsArray.includes(projectManagerId))
    vendorIds.push(projectManagerId);

  projectName = projectName.trim();

  if (!projectName) return res.status(400).json("Project Name can't be empty");

  const projectAvaible = await Project.findOne({
    projectName: { $regex: new RegExp(`^${projectName.toLowerCase()}$`, "i") },
    companyId: req.user.id,
  });

  if (!projectAvaible) {
    const project = await Project.create({
      projectName,
      companyId: req.user.id,
      vendorIds,
      projectManagerId,
    });
    await Company.findByIdAndUpdate(
      req.user.id,
      { $push: { projectIds: project._id } },
      { new: true }
    );
    await vendorIds.forEach((element) => {
      User.findByIdAndUpdate(
        element,
        { $push: { projectIds: project._id } },
        { new: true }
      ).then();
    });
    res.status(201).json(project);
  } else {
    res.status(400).json("Project Name already exists");
    return;
  }
});

//@dec Get all projects
//@route GET /api/projects
//@access private
const getProjects = asyncHandler(async (req, res) => {
  var Project;
  if (req.user.role == "admin") Project = Company;
  else Project = User;

  Project.findOne({ _id: req.user.id })
    .populate("projectIds")
    .then((company) => {
      projects = company.projectIds.map((project) => ({
        _id: project._id,
        projectName: project.projectName,
      }));
      res.status(200).json(projects);
    })
    .catch((error) => {
      res.status(500).json({ error: error.message });
    });
});

//@dec Get one project
//@route GET /api/projects/:id
//@access private
const getProjectById = asyncHandler(async (req, res) => {
  Project.findOne({ _id: req.params.id })
    .populate("vendorIds")
    .populate("projectManagerId")
    .then((project) => {
      const users = project.vendorIds.map((vendor) => ({
        _id: vendor._id,
        userName: vendor.userName,
        dailySalary: vendor.dailySalary,
        email: vendor.email,
        role: vendor.role,
        firstName: vendor.firstName,
        lastName: vendor.lastName,
        phoneNumber: vendor.phoneNumber,
        prefferedContact: vendor.prefferedContact,
      }));
      project.vendorIds = users;
      res.status(200).json({ project, users });
    })
    .catch((error) => {
      res.status(500).json({ error: error.message });
    });
});

//@dec Post create report
//@route POST /api/projects/reports/new
//@access private
const createReport = asyncHandler(async (req, res) => {
  var currentUser;
  const { reportDescription, projectId } = req.body;

  if (req.user.role == "admin") currentUser = Company;
  else currentUser = User;

  const user = await currentUser.findById(req.user.id);
  try {
    const project = await Project.findOne({ _id: projectId });
    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }
    const report = {
      userName: user.userName || user.companyName,
      reportDescription: reportDescription,
    };
    if (!project.reports) {
      project.reports = [];
    }
    project.reports.push(report);
    await project.save();
    res.status(200).json({
      message: "Report created successfully.",
    });
  } catch (error) {
    res.status(400).json({
      message: "Error creating report. Please try again.",
    });
  }
});

//@dec Delete project
//@route DELETE /api/projects/:id
//@access private
const deleteProject = asyncHandler(async (req, res) => {
  Company.findOne({ _id: req.user.id })
    .populate("projectIds")
    .then((company) => {
      project = company.projectIds.find(
        (project) => project._id == req.params.id
      );

      if (!project) return res.status(404).json("project not found");

      User.updateMany(
        { _id: project.vendorIds },
        { $pull: { projectIds: req.params.id, favoriteProjects: req.params.id } }
      ).then();

      Company.findByIdAndUpdate(
        req.user.id,
        {
          $pull: { projectIds: req.params.id, favoriteProjects: req.params.id}, 
        }
         ).then();

      Project.deleteOne({ _id: req.params.id }).then((project) => {
        res.status(200).json({
          message: "Project deleted successfully!",
        });
      });
    })
    .catch((error) => {
      res.status(400).json("Something went wrong");
    });
});

//@dec Post create project
//@route POST /api/projects/new
//@access private
const editProject = asyncHandler(async (req, res) => {
  var { projectName, projectManagerId } = req.body;

  projectName = projectName.trim();

  const projectAvaible = await Project.findOne({ _id: req.params.id });

  const isProjectNameExist = await Project.findOne({
    projectName: { $regex: new RegExp(`^${projectName.toLowerCase()}$`, "i") },
    companyId: req.user.id,
  });

  var isVendorExist = false;

  if (
    projectAvaible &&
    (!isProjectNameExist ||
      projectAvaible.projectName == isProjectNameExist.projectName)
  ) {
    await Project.findByIdAndUpdate(
      req.params.id,
      {
        $set: { projectName, projectManagerId },
      },
      { new: true }
    );

    res.status(201).json("Project updated successfully");
  } else {
    if (isProjectNameExist)
      return res.status(400).json("Project name already exists");
    res.status(400).json("Project is not exist!");
    return;
  }
});

//@dec Post create project
//@route POST /api/projects/new
//@access private
const deleteUserFromProject = asyncHandler(async (req, res) => {
  const { deletedVendorIds } = req.body;

  const projectAvaible = await Project.findOne({ _id: req.params.id });
  if (projectAvaible) {
    deletedVendorIds.forEach((userId) => {
      Project.findById(req.params.id)
        .then((project) => {
          if (
            project.projectManagerId &&
            project.projectManagerId.equals(userId)
          ) {
            project.projectManagerId = null;
            return project.save();
          }
          return Promise.resolve(project);
        })
        .then((project) => {
          return Project.findByIdAndUpdate(
            req.params.id,
            {
              $pull: { vendorIds: userId },
            },
            { new: true }
          );
        })
        .then(() => {
        })
        .catch((error) => {
          res.status(400).json("Project error");
        });
    });

    User.updateMany(
      { _id: deletedVendorIds },
      { $pull: { projectIds: req.params.id } }
    ).then();

    res.status(200).json("Vendor deleted successfully");
  } else {
    res.status(400).json("Project is not exist!");
    return;
  }
});

//@dec Post create project
//@route POST /api/projects/new
//@access private
const addUserToProject = asyncHandler(async (req, res) => {
  const { newVendorIds } = req.body;
  var isVendorExist = false;

  const projectAvaible = await Project.findOne({ _id: req.params.id });
  if (projectAvaible) {
    newVendorIds.forEach((element) => {
      if (projectAvaible.vendorIds.includes(element)) {
        isVendorExist = true;
        return;
      }
    });

    if (isVendorExist)
      return res.status(400).json("This vendor is already in this project");

    await Project.findByIdAndUpdate(
      req.params.id,
      {
        $push: { vendorIds: newVendorIds },
      },
      { new: true }
    );

    User.updateMany(
      { _id: newVendorIds },
      { $push: { projectIds: req.params.id } }
    ).then();

    res.status(200).json("Vendor added successfully");
  } else {
    res.status(400).json("Project is not exist!");
    return;
  }
});

//@dec Get Commpany Project'S Efforts
//@route GET /api/projects/efforts
//@access private
const getCompanyEfforts = asyncHandler(async (req, res) => {
  var Project;
  if (req.user.role == "admin") Project = Company;
  else Project = User;

  Project.findOne({ _id: req.user.id })
    .populate({
      path: "projectIds",
      populate: {
        path: "effortIds",
        model: "Effort", // Replace with your Effort model name
      },
    })
    .then((company) => {
      const projects = company.projectIds.map((project) => ({
        projectName: project.projectName,
        efforts: project.effortIds,
      }));
      res.status(200).json(projects);
    })
    .catch((error) => {
      res.status(500).json({ error: error.message });
    });
});

const favoritesProject = asyncHandler(async (req, res) => {
  try {
    const user = req.user.role === "admin" ? Company : User;
    const userName = req.user.role === "admin" ? "companyName" : "userName";

    const projectId = req.body.projectId;
    const userId = req.user.id;
    console.log("ProjectId", projectId, "UserId", userId);

    const project = await Project.findById(projectId);
    const user1 = await user.findById(userId);

    if (!user1 || !project) {
      res.status(404).json({ message: "User or project not found" });
      return;
    }

    if (user1.favoriteProjects.includes(projectId)) {
      res.status(400).json({ message: "Project already in favorites" });
      return;
    }

    if (user1.favoriteProjects.length >= 5) {
      res
        .status(400)
        .json({ message: "Maximum limit reached for favorite projects" });
      return;
    }

    await Company.findByIdAndUpdate(
      userId,
      { $push: { favoriteProjects: projectId } },
      { new: true }
    );

    await User.findByIdAndUpdate(
      userId,
      { $push: { favoriteProjects: projectId } },
      { new: true }
    );

    res.status(200).json({ favoritesProjects: projectId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

const getUserFavoriteProjects = asyncHandler(async (req, res) => {
  var Project;
  if (req.user.role == "admin") Project = Company;
  else Project = User;

  Project.findOne({ _id: req.user.id })
    .populate("favoriteProjects")
    .then((company) => {
      favorites = company.favoriteProjects.map((favorite) => ({
        id: favorite._id.toString(),
      }));
      res.status(200).json(favorites.map((favorite) => favorite.id));
    })
    .catch((error) => {
      res.status(500).json({ error: error.message });
    });
});

const deleteFavoriteProject = asyncHandler(async (req, res) => {
  try {
    const user = req.user.role === "admin" ? Company : User;
    const userName = req.user.role === "admin" ? "companyName" : "userName";

    const projectId = req.body.projectId;
    const userId = req.user.id;

    const user1 = await user.findById(userId);

    if (!user1) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    if (!user1.favoriteProjects.includes(projectId)) {
      res.status(400).json({ message: "Project not found in favorites" });
      return;
    }

    await Company.findByIdAndUpdate(
      userId,
      { $pull: { favoriteProjects: projectId } },
      { new: true }
    );

    await User.findByIdAndUpdate(
      userId,
      { $pull: { favoriteProjects: projectId } },
      { new: true }
    );

    res.status(200).json({ favoritesProjects: projectId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = {
  createProject,
  getProjects,
  getProjectById,
  createReport,
  deleteProject,
  editProject,
  deleteUserFromProject,
  addUserToProject,
  getCompanyEfforts,
  favoritesProject,
  getUserFavoriteProjects,
  deleteFavoriteProject,
};
