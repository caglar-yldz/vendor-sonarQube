const { body } = require("express-validator");

function validatePassword(password) {
  return [
    // body(password)
    //   .matches(/[a-z]/)
    //   .withMessage("Password must contain at least one lowercase letter."),
    // body(password)
    //   .matches(/[A-Z]/)
    //   .withMessage("Password must contain at least one uppercase letter."),
    body(password)
      .matches(/[a-zA-Z]/)
      .withMessage("Password must contain at least one letter."),
    body(password)
      .matches(/\d/)
      .withMessage("Password must contain at least one digit."),
    // body(password)
    //   .matches(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/)
    //   .withMessage("Password must contain at least one special character."),
    body(password)
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters long."),
  ];
}

function validateEmail(email) {
  return [
    body(email).isEmail().withMessage("Please enter a valid email address."),
  ];
}

function validateUserName(userName) {
  return [
    body(userName)
      .isLength({ min: 3 })
      .withMessage("userName must be at least 3 characters long."),
  ];
}

module.exports = { validatePassword, validateEmail, validateUserName };
