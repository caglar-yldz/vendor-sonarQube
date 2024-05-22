const express = require("express");
const router = express.Router();
const validateToken = require("../middleware/validateTokenHandler");
const {
  favoritesProject,
  getUserFavoriteProjects,
  deleteFavoriteProject
} = require("../controller/projectController");


router.post("/favorite", validateToken(["admin", "project_manager","user"]), favoritesProject);
router.get("/", validateToken(["admin", "user", "project_manager"]), getUserFavoriteProjects);
router.post("/favoritedelete", validateToken(["admin", "user", "project_manager"]), deleteFavoriteProject);

router.all("/favorite", (req, res) => {
  res.status(405).send("Method Not Allowed");
});
router.all("/", (req, res) => {
  res.status(405).send("Method Not Allowed");
});
router.all("/favoritedelete", (req, res) => {
  res.status(405).send("Method Not Allowed");
});
module.exports = router;
