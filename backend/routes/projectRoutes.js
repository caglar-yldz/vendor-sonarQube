const express = require("express");
const router = express.Router();
const validateToken = require("../middleware/validateTokenHandler");
const {
  createProject,
  getProjects,
  getProjectById,
  createReport,
  deleteProject,
  editProject,
  deleteUserFromProject,
  addUserToProject,
  getCompanyEfforts,

} = require("../controller/projectController");

router.get("/", validateToken(["admin", "user", "project_manager"]), getProjects);
router.get("/efforts", validateToken(["admin", "user", "project_manager"]), getCompanyEfforts);
router.get("/:id", validateToken(["admin", "user", "project_manager"]), getProjectById);
router.post("/reports/new", validateToken(["admin", "user"]), createReport);
router.post("/new", validateToken(["admin"]), createProject);
router.put("/:id", validateToken(["admin", "project_manager"]), editProject);
router.delete("/users/:id", validateToken(["admin", "project_manager"]), deleteUserFromProject);
router.post("/users/:id", validateToken(["admin", "project_manager"]), addUserToProject);
router.delete("/:id", validateToken(["admin"]), deleteProject);

router.all("/", (req, res) => {
  res.status(405).send("Method Not Allowed");
});
router.all("/efforts", (req, res) => {
  res.status(405).send("Method Not Allowed");
});
router.all("/reports/new", (req, res) => {
  res.status(405).send("Method Not Allowed");
});
router.all("/new", (req, res) => {
  res.status(405).send("Method Not Allowed");
});
router.all("/:id", (req, res) => {
  res.status(405).send("Method Not Allowed");
});
router.all("/users/:id", (req, res) => {
  res.status(405).send("Method Not Allowed");
});


module.exports = router;
