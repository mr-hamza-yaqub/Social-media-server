const User = require("../models/User");
// Json WEb Token
const jwt = require("jsonwebtoken");
// bcrypt is Used To Hshing PAssword
const bcrypt = require("bcrypt");
const { error, success } = require("../Utils/responseWrapper");
// SignUp Controller
const signUpController = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    // Eamil And Pass are Required:
    if (!email || !password || !name) {
      // return res.status(400).send("All Fields Are Required!");
      return res.send(error(400, "All Fields Are Required!"));
    }

    // Unique Email:
    const oldUser = await User.findOne({ email });
    if (oldUser) {
      // return res.status(409).send("User is already Registerd!");
      return res.send(error(409, "User is already Registerd!"));
    }
    // Hashing Password usifn Bcrypt:
    const hashedPass = await bcrypt.hash(password, 10);
    // Creating New User :-(mongoDb function):
    const user = await User.create({
      name,
      email,
      password: hashedPass,
    });
    // return res.status(201).json({ user });
    return res.send(success(201, "User Createad Successfully!"));
  } catch (e) {
    // If Error Then Console it
    return res.send(error(500, e.message));
  }
};
// Login Controller

const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;
    // Eamil And Pass are Required

    // Check User
    // SignUp krty waqt password show niii ho ga is leye .select("+password") likha is se pass show ho gae ga

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      // return res.status(404).send("User is not Registered!");
      return res.send(error(404, "User is not Registered!"));
    }
    // Checking Pass use BCrypt
    const matched = await bcrypt.compare(password, user.password);
    if (!matched) {
      // return res.status(403).send("Incorrect Password");
      return res.send(error(403, "Incorrect Password!"));
    }
    const accessToken = generateAccessToken({
      _id: user.id,
    });
    const refreshToken = generateRefreshToken({
      _id: user.id,
    });

    // Sending refreshToken to Cookie
    res.cookie("jwt", refreshToken, {
      httpOnly: true,
      secure: true,
    });
    return res.send(success(201, { accessToken }));
  } catch (e) {
    return res.send(error(500, e.message));
  }
};

const logoutController = async (req, res) => {
  try {
    // Removing  refreshToken from Cookie its frontend responsibilty to remove access token from local Storage
    res.clearCookie("jwt", {
      httpOnly: true,
      secure: true,
    });
    return res.send(success(200, "User Logged Out"));
  } catch (e) {
    return res.send(error(500, e.message));
  }
};

// This API will Check the refreshToken validity and generate a new access Token
const refreshAccessTokenController = async (req, res) => {
  const cookies = req.cookies;
  if (!cookies.jwt) {
    // return res.status(401).send("Refresh Token in Cookies is Required!");
    return res.send(error(401, "Refresh Token in Cookies is Required!"));
  }
  // Getting refreshToken from the Cookies
  const refreshToken = cookies.jwt;
  try {
    const decoded = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_PRIVATE_KEY
    );

    const _id = decoded._id;
    const accessToken = generateAccessToken({ _id });
    // return res.status(201).json({ accessToken });
    return res.send(success(201, { accessToken }));
  } catch (e) {
    console.log(e);
    // return res.status(401).send("Invalid Refresh Token");
    return res.send(error(401, "Invalid Refresh Token"));
  }
};
//Internal Function-->it is not exported it is just used to make a access token
const generateAccessToken = (data) => {
  try {
    const token = jwt.sign(data, process.env.ACCESS_TOKEN_PRIVATE_KEY, {
      expiresIn: "1d",
    });
    return token;
  } catch (error) {
    console.log(error);
  }
};
// Refresh Token Expiry is More than AccessToken Bcz we Dont want that our user login again and again
// we Save it in very Secure Place to prevent this token from Hacker
// Agr HAcker k hath Lag gya to WO hamara web use kr paye ga
// **********************It is Very Important thing**************************
const generateRefreshToken = (data) => {
  try {
    const token = jwt.sign(data, process.env.REFRESH_TOKEN_PRIVATE_KEY, {
      expiresIn: "1y",
    });
    return token;
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  signUpController,
  loginController,

  refreshAccessTokenController,
  logoutController,
};
