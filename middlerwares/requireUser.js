const jwt = require("jsonwebtoken");
const { error, success } = require("../Utils/responseWrapper");
const User = require("../models/User");

module.exports = async (req, res, next) => {
  // Check req.header authourization and check that is it start with Bearer
  // YE middlewarea Check kre ga k kia header me authorization token aa rha he k nii
  if (
    !req.headers ||
    !req.headers.authorization ||
    !req.headers.authorization.startsWith("Bearer")
  ) {
    // return res.status(401).send("Authorization header is Required!");
    return res.send(error(401, "Authorization header is Required!"));
  }
  const accessToken = req.headers.authorization.split(" ")[1];
  try {
    const decoded = jwt.verify(
      accessToken,
      process.env.ACCESS_TOKEN_PRIVATE_KEY
    );
    req._id = decoded._id;
    const user = await User.findById(req._id);
    if (!user) {
      res.send(error(404, "User Not Found"));
    }
    next();
  } catch (e) {
    console.log(e);
    // return res.status(401).send("Invalid Access Token");
    return res.send(error(401, "Invalid Access Token"));
  }
};
