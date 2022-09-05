const User = require("../models/user");
const jwt = require("jsonwebtoken");
const expressJWT = require("express-jwt");

exports.signup = async (req, res) => {
  const {name, email, phoneNumber, password, address} = req.body;
  try {
    const user = await User.create({name, email, phoneNumber, password, address});
    await user.save();
    user.encry_password = undefined;
    user.createdAt = undefined;
    user.updatedAt = undefined;
    return res.json(user);
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      message: "Failed to create a user in DB",
    });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {

  const user = await User.findOne({ email })
  if (!user) {
    return res.status(400).json({
      error: "Invalid email or password",
    });
  }

  if ( await user.authenticate(password)) {
    const token = jwt.sign({ _id: user._id }, process.env.SECRET);
    // res.cookie("token", token, { expires: new Date() + 9999 });

    const { _id, name, email, role } = user;

    return res.json({ token, user: { _id, name, email, role } });
  }

  return res.status(400).json({
    error: "Invalid email or password",
  });
} catch (error) {
  console.log(error.message)
  return res.status(400).json({
    error: "Invalid email or password, reached here",
  });
}
};

exports.logout = (req, res) => {
  res.clearCookie("token");
  return res.status(200).json({
    message: "Logged out successfully",
  });
};

// isSignedIN
exports.isSignedIn = expressJWT({
  secret: process.env.SECRET,
  algorithms: ["HS256"],
  userProperty: "user"
});

// isAuthenticated
exports.isAuthenticated = (req, res, next) => {
  const checker = req.profile && req.user && req.profile._id == req.user._id;
  if (!checker) {
    return res.status(403).json({
      message: "Authentication failed",
    });
  }
  next();
};

// isAdmin
exports.isAdmin = (req, res, next) => {
  if (req.profile.role !== 2) {
    return res.status(403).json({
      message: "You are not admin, Access denied",
    });
  }
  next();
};

// isEmployee
exports.isEmployee = (req, res, next) => {
  if (req.profile.role !== 1) {
    return res.status(403).json({
      message: "You are not employee, Access denied",
    });
  }
  next();
};

// isCustomer
exports.isCustomer = (req, res, next) => {
  if (req.profile.role !== 0) {
    return res.status(403).json({
      message: "You are not custoer, Access denied",
    });
  }
  next();
};
