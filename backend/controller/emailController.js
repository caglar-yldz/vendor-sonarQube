const nodemailer = require("nodemailer");
const asyncHandler = require("express-async-handler");
const Company = require("../models/companyModel");
const User = require("../models/userModel");
const ejs = require("ejs");
const path = require("path");
const crypto = require("crypto");
const { validationResult } = require("express-validator");

// E-posta gönderme işlemi için bir taşıyıcı (transporter) oluştur
let transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: "yigit.agar22@gmail.com",
    pass: "pquj tvkw dmab xqsc",
  },
});

//@dec Post send email
//@route POST /api/email/send
//@access private
const addUsertoCompany = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const companyId = req.user.id;

  try {
    const company = await Company.findById(companyId).select("companyName");
    const user = await User.findOne({ email });
    req.companyName = company.companyName;

    if(user){
      res.status(400).json("User already exists");
      return;
    }

    if (!user || !company) {

      const match = email.match(/[^@]*/);

      const userName = match[0];

      const randomPassword = Math.random().toString(36).slice(-8);
      const hashedPassword = crypto
        .createHash("sha256")
        .update(randomPassword)
        .digest("hex");
      const newUser = await new User({
        userName: userName,
        email: email,
        password: hashedPassword,
        companyId: companyId,
        role: "user",
      });
      await newUser.save();

      unRegisterInvitation(req, res);
      return;
    }
    sendInvitation(req, res);
  } catch (error) {
    res.status(500).json(error);
  }
});

const unRegisterInvitation = asyncHandler(async (req, res, error, info) => {
  const { email, dailySalary } = req.body;
  const user =
    (await User.findOne({ email })) || (await Company.findOne({ email }));
  if (!user) {
    res.status(404).json("No user found with that email");
    return;
  }
  // Generate a JWT with the email as the payload
  const token = jwt.sign(
    { user: { email: email, role: user.role } },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "1h" }
  );
  const html = await ejs.renderFile(
    path.join(__dirname, "../mailTemplates", "unregisterInvitation.ejs"),
    {
      companyName: req.companyName,
      email: email,
      dailySalary: dailySalary,
      apiPortFe: process.env.VITE_FE_PORT,
      token: token,
      apiPort: process.env.VITE_API_PORT,
    }
  );

  const mailOptions = {
    from: process.env.AUTH_MAIL,
    to: email,
    subject: "Firmaya davet edildiniz",
    html: html,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json("email successfully sent");
  } catch (error) {
    return;
  }
});

const sendInvitation = asyncHandler(async (req, res, error, info) => {
  const { email, dailySalary } = req.body;

  const html = await ejs.renderFile(
    path.join(__dirname, "../mailTemplates", "emailTemplate.ejs"),
    {
      companyName: req.companyName,
      email: email,
      dailySalary: dailySalary,
      apiPort: process.env.VITE_API_PORT,
    }
  );

  const mailOptions = {
    from: process.env.AUTH_MAIL,
    to: email,
    subject: "Firmaya davet edildiniz",
    html: html,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json("email successfully sent");
  } catch (error) {
    return;
  }
});

//@dec PUT forget password
//@route PUT /api/user/:email
//@access private
const forgetPassword = asyncHandler(async (req, res) => {
  const { newpassword, newpassword2 } = req.body;
  const email = req.user.email;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      errors: errors
        .array()
        .map((error) => ({ path: error.path, msg: error.msg })),
    });
  }

  try {
    let userOrCompany =
      (await User.findOne({ email: email })) ||
      (await Company.findOne({ email: email }));

    if (!userOrCompany) {
      res.status(404).json("User or company not found");
    } else {
      if (newpassword !== newpassword2) {
        res.status(400).json("Passwords do not match");
        return;
      }
      userOrCompany.password = newpassword;
      await userOrCompany.save();
      res
        .status(200)
        .json({ message: "Password changed", user: userOrCompany });
    }
  } catch (error) {
    res.status(500).json(error);
  }
});

//@dec POST send forget password mail
//@route POST /api/user/:email
//@access private
const jwt = require("jsonwebtoken");

const sendForgetPasswordMail = asyncHandler(async (req, res, error, info) => {
  const email = req.params.email;

  const user =
    (await User.findOne({ email })) || (await Company.findOne({ email }));
  if (!user) {
    res.status(404).json("No user found with that email");
    return;
  }
  // Generate a JWT with the email as the payload
  const token = jwt.sign(
    { user: { email: email, role: user.role } },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "1h" }
  );
  const html = await ejs.renderFile(
    path.join(__dirname, "../mailTemplates", "resetPassword.ejs"),
    {
      token: token,
      apiPort: process.env.VITE_FE_PORT,
    }
  );

  const mailOptions = {
    from: process.env.AUTH_MAIL,
    to: email,
    subject: "Password Reset Request",
    html: html,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json("email successfully sent");
  } catch (error) {
    res.status(500).json(error);
  }
});

module.exports = {
  sendInvitation,
  addUsertoCompany,
  forgetPassword,
  sendForgetPasswordMail,
};
