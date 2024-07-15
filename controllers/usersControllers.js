const User = require("../models/User");
const Note = require("../models/Note");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");

//Get all users
//route Get /users
//access private
const getAllUser = asyncHandler(async (req, res) => {
  const user = await User.find().select("-password").lean();
  if (!user) {
    return res.status(400).json({ message: "No users found" });
  }
  res.json(user);
});

//create a new user
//route Post /user
//access private
const creatNewUser = asyncHandler(async (req, res) => {
  const { username, password, roles } = req.body;

  //confirming data
  if (!username || !password || !Array.isArray(roles) || !roles.length) {
    return res.status(400).json({ message: "All fields are required" });
  }

  //check for duplicate
  const duplicate = await User.findOne({ username }).lean().exec();

  if (duplicate) {
    return res.status(409).json({ message: "Duplicate username" });
  }

  //Hash password
  const hashedPassword = await bcrypt.hash(password, 10); // salt rounds

  const userObject = { username, password: hashedPassword, roles };

  //create and store a new user
  const user = await User.create(userObject);

  if (user) {
    return res.status(201).json({ message: `New user ${username} created` });
  } else {
    res.status(400).json({ message: "Invalid user data recieved " });
  }
});

//update a user
//route PATCH /user
//access private
const updateUser = asyncHandler(async (req, res) => {
  const { id, username, roles, active, password } = req.body;

  //comfirm data
  if (
    !id ||
    !username ||
    !Array.isArray(roles) ||
    !roles.length ||
    typeof active !== "boolean"
  ) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const user = await User.findById(id).exec();

  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }

  //check for duplicate
  const duplicate = await User.findOne({ username }).lean().exec();

  //Allow update to the original user

  if (duplicate && duplicate?._id.toString() !== id) {
    return res.status(409).json({ message: `Duplicate username` });
  }
  user.username = username;
  user.roles = roles;
  user.active = active;

  if (password) {
    //hashing password
    user.password = await bcrypt.hash(password, 10);
  }

  const updatedUser = await user.save();
  res.json({ message: `${updatedUser.username} updated` });
});

//delete a new user
//route DELETE /user
//access private
const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ message: "User id required" });
  }

  const notes = await Note.findOne({ user: id }).lean().exec();

  if (notes?.length) {
    return res.status(400).json({ message: "User has assigned notes" });
  }

  const user = await user.findById(id).exec();

  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }

  const result = await user.deleteOne();

  const reply = `Username ${result.username} with ID ${result._id} deleted`;

  res.json(reply);
});

module.exports = {
  getAllUser,
  creatNewUser,
  updateUser,
  deleteUser,
};
