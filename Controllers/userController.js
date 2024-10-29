const express = require("express");
const UserModel = require("../modals/userModel");
const expressAsyncHandler = require("express-async-handler");
const generateToken = require("../Config/generateToken");

// Login
const loginController = expressAsyncHandler(async (req, res) => {
  const { name, password } = req.body;
  const user = await UserModel.findOne({ name });

  if (user && (await user.matchPassword(password))) {
    const response = {
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      token: generateToken(user._id),
    };
    res.json(response);
  } else {
    res.status(401).send({ message: "Invalid Username or Password" });
  }
});

// Registration
const registerController = expressAsyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  // Check for all fields
  if (!name || !email || !password) {
    res.status(400).send({ message: "All fields are required" });
    return;
  }

  // Check for pre-existing user
  const userExist = await UserModel.findOne({ email });
  if (userExist) {
    res.status(400).send({ message: "User already exists" });
    return;
  }

  // Check for username availability
  const userNameExist = await UserModel.findOne({ name });
  if (userNameExist) {
    res.status(400).send({ message: "Username already taken" });
    return;
  }

  // Create an entry in the database
  const user = await UserModel.create({ name, email, password });
  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      token: generateToken(user._id),
    });
  } else {
    res.status(400).send({ message: "Registration Error" });
  }
});

// Fetch all users excluding the current user
const fetchAllUsersController = expressAsyncHandler(async (req, res) => {
  const keyword = req.query.search
    ? {
        $or: [
          { name: { $regex: req.query.search, $options: "i" } },
          { email: { $regex: req.query.search, $options: "i" } },
        ],
      }
    : {};

  const users = await UserModel.find(keyword).find({
    _id: { $ne: req.user._id },
  });
  res.json(users);
});

module.exports = {
  loginController,
  registerController,
  fetchAllUsersController,
};
