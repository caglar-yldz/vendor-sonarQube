const express = require("express");
const router = express.Router();
const validateToken = require("../middleware/validateTokenHandler");
const {
  addUsertoCompany,
  forgetPassword,
  sendForgetPasswordMail,
} = require("../controller/emailController");
const { validatePassword } = require("../validators/userValidator");

router.post("/send", validateToken(["admin"]), addUsertoCompany);
router.post(
  "/",
  validateToken(["admin", "user", "project_manager"]),
  validatePassword("newpassword"),
  forgetPassword
);
router.post("/:email", sendForgetPasswordMail);

router.all("/send", (req, res) => {
  res.status(405).send("Method Not Allowed");
});
router.all("/:email", (req, res) => {
  res.status(405).send("Method Not Allowed");
});

module.exports = router;
