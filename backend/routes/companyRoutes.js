const express = require("express");
const router = express.Router();
const validateToken = require("../middleware/validateTokenHandler");
const {
  getUser,
  companyAccept,
  deleteUser,
  updateUser,
  getUserById,
} = require("../controller/companyController");

router.get("/users", validateToken(["admin", "project_manager"]), getUser);
router.get(
  "/users/:id",
  validateToken(["admin", "project_manager", "user"]),
  getUserById
);
router.post("/accept", companyAccept);
router.delete("/users/:id", validateToken(["admin"]), deleteUser);
router.put("/users/:id", validateToken(["admin"]), updateUser);

router.all("/users", (req, res) => {
  res.status(405).send("Method Not Allowed");
});
router.all("/users/:id", (req, res) => {
  res.status(405).send("Method Not Allowed");
});
router.all("/accept", (req, res) => {
  res.status(405).send("Method Not Allowed");
});

module.exports = router;
