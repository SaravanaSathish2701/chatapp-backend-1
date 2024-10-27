const express = require("express");
const UserModel = require("../modals/userModel");
const expressAsyncHandler = require("express-async-handler");
const generateToken = require("../Config/generateToken");

// Login
const loginController = expressAsyncHandler(async (req, res) => {
  console.log(req.body);
  const { name, password } = req.body;
  const user = await UserModel.findOne({ name });

  console.log("Featched user data");
  console.log(await user.matchPassword(password));
  if (user && (await user.matchPassword(password))) {
    const response = {
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      token: generateToken(user._id),
    };
    console.log(response);
    res.json(response);
  } else {
    res.send(401);
    throw new Error("Invalid UserName or Password");
  }
});

// Registration
const registerController = expressAsyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  //   check for all fields
  if (!name || !email || !password) {
    res.send(400);
    throw Error("All fields are required");
  }

  //   pre-existing user
  const userExist = await UserModel.findOne({ email });
  if (userExist) {
    throw new Error("User already exists");
  }

  //   username already taken
  const userNameExist = await UserModel.findOne({ name });
  if (userNameExist) {
    throw new Error("Username already taken");
  }

  //   create an entry in the database
  const user = UserModel.create({ name, email, password });
  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error("Registration Error");
  }
});

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
  res.send(users);
});

module.exports = {
  loginController,
  registerController,
  fetchAllUsersController,
};
