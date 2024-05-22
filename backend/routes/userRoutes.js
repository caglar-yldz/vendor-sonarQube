const express = require("express");
const router = express.Router();
const {
  login,
  current,
  profileEdit,
  firstInfo,
  isEmpty,
} = require("../controller/userController");
const validateToken = require("../middleware/validateTokenHandler");

router.route("/login").post(login);
router.get(
  "/current",
  validateToken(["admin", "user", "project_manager"]),
  current
);
router.put(
  "/current",
  validateToken(["admin", "user", "project_manager"]),
  profileEdit
);
router.post(
  "/firstinfo",
  validateToken(["user", "project_manager"]),
  firstInfo
);
router.get("/isEmpty", validateToken(["user", "project_manager"]), isEmpty);

router.all("/login", (req, res) => {
  res.status(405).send("Method Not Allowed");
});
router.all("/current", (req, res) => {
  res.status(405).send("Method Not Allowed");
});
router.all("/firstinfo", (req, res) => {
  res.status(405).send("Method Not Allowed");
});
router.all("/isEmpty", (req, res) => {
  res.status(405).send("Method Not Allowed");
});
module.exports = router;
