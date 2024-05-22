const asyncHandler = require("express-async-handler");
const Company = require("../models/companyModel");
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");

//@dec Post login informations
//@route POST /api/user/login
//@access public
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  var user;
  // e-mail'e kayıtlı kullanıcı var mı kontrol.
  user = await Company.findOne({ email });
  if (!user) {
    user = await User.findOne({ email });
  }

  // kullanıcı varsa şifre kontrol.
  if (user && (password == user.password)) {
    const accessToken = jwt.sign(
      {
        user: {
          id: user.id,
          role: user.role
        },
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "600m" }
    );
    res.status(200).json({ accessToken });
  } else {
    res.status(401).json("Incorrect username or password.");
    return;
  }
});

//@dec Get current informations
//@route GET /api/user/current
//@access private
const current = asyncHandler(async (req, res) => {
  var user;
  if (req.user.role == "admin") {
    user = await Company.findById(req.user.id).select(
      "companyName email password role firstName lastName address about"
    );
  } else {
    user = await User.findById(req.user.id)
      .select("userName email role effortIds about projectIds dailySalary address firstName lastName phoneNumber prefferedContact")
      .populate("effortIds");
  }

  res.json(user);
});

//@dec Get current informations
//@route GET /api/user/current
//@access private
const profileEdit = asyncHandler(async (req, res) => {

  const user = req.user.role == "admin" ? Company : User;
  const userName = req.user.role == "admin" ? "companyName" : "userName";

  await user.findByIdAndUpdate(
    req.user.id,
    {
      $set: {
        [userName]: req.body.userName,
        address: req.body.address,
        about: req.body.about,

      }
    },
    { new: true }
  );
  res.json("Profile updated");
});






//@dec Update user infomations
//@route Post /api/users/firstinfo
//@Access private
const firstInfo = asyncHandler(async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      {
        $set: {
          firstName: req.body.firstName,
          lastName: req.body.lastName,
          phoneNumber: req.body.phoneNumber,
          prefferedContact: req.body.prefferedContact,
        }
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: "User informations updated", user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

//@dec Check if users firstname empty or not
//@route Post /api/users/isEmpty
//@Access private
const isEmpty = asyncHandler(async (req, res) => {
  const id = req.user.id;
  User.findById(id).then((user) => {
    if (user.firstName == "") {
      res.json(true);
    } else {
      res.json(false);
    }
  }).catch(err => {
    res.status(500).json({ message: 'Server error', error: err.message });
  });
});




module.exports = { login, current, profileEdit, firstInfo, isEmpty };