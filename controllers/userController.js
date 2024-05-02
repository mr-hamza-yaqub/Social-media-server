const { success, error } = require("../Utils/responseWrapper");
const User = require("../models/User");
const Post = require("../models/Post");
const { mapPostOutput } = require("../Utils/Utils");
const cloudinary = require("cloudinary").v2;

const followOrUnfollowUserController = async (req, res) => {
  try {
    const { userIdToFollow } = req.body;
    const currUserId = req._id;

    const userToFollow = await User.findById(userIdToFollow);
    const curUser = await User.findById(currUserId);
    // If User Trying to Follow Himself🔴
    if (currUserId === userIdToFollow) {
      return res.send(error(409, "Can't follow yourself!"));
    }
    //User Whose Tried to follow is Deleted or not Present:
    if (!userToFollow) {
      return res.send(error(404, "User to Follow Not Found!"));
    }

    // //Already Followed--->Unfollow Code
    if (curUser.followings.includes(userIdToFollow)) {
      // Removing from following of Current User
      const followingIndex = curUser.followings.indexOf(userIdToFollow);
      curUser.followings.splice(followingIndex, 1);
      // Removing from followers of 2nd Person User
      const followerIndex = userToFollow.followers.indexOf(curUser);
      curUser.followers.splice(followerIndex, 1);
    } else {
      //  Follow
      userToFollow.followers.push(currUserId);
      curUser.followings.push(userIdToFollow);
    }
    await userToFollow.save();
    await curUser.save();
    return res.send(success(200, { user: userToFollow }));
  } catch (e) {
    return res.send(error(500, e.message));
  }
};
// Getting Posts of Followings:
const getPostsOfFollowingController = async (req, res) => {
  // GET all Posts Of which are in the  Following of Current User:
  // Un Owners ki posts ly k any he jo current user ki followings me hy:
  try {
    const curUserId = req._id;
    const curUser = await User.findById(curUserId).populate("followings");

    const fullPosts = await Post.find({
      owner: {
        $in: curUser.followings,
      },
    }).populate("owner");
    // Mapings posts
    const posts = fullPosts
      .map((item) => mapPostOutput(item, req._id))
      .reverse();

    // /Taking Followings ids list of crrUser
    const followingIds = curUser.followings.map((item) => item._id);
    followingIds.push(req._id);
    // Taking Those Who are NOt in the Curr user Following Lists
    const suggestions = await User.find({
      _id: {
        $nin: followingIds,
      },
    });
    return res.send(success(200, { ...curUser._doc, suggestions, posts }));
  } catch (e) {
    return res.send(error(500, e.message));
  }
};
// Getting my posts
const getMyPost = async (req, res) => {
  try {
    const curUserId = req._id;
    const allUserPosts = await Post.find({
      owner: curUserId,
    }).populate("likes");
    return res.send(success(200, { allUserPosts }));
  } catch (e) {
    return res.send(error(500, e.message));
  }
};
// Just For Practice (Backend helpful while api handling no use case in project)
const getMyInfo = async (req, res) => {
  try {
    const user = await User.findById(req._id);
    return res.send(success(200, { user }));
  } catch (e) {
    return res.send(error(500, e.message));
  }
};
// Get Other User Posts
const getUserPosts = async (req, res) => {
  try {
    const { userId } = req.body;
    const curUser = req._id;
    if (!userId) {
      return res.send(error(400, "User Id is Required"));
    }
    if (!curUser) {
      return res.send(error(400, "User not Found"));
    }
    const UserPosts = await Post.find({
      owner: userId,
    }).populate("likes");
    return res.send(success(200, { UserPosts }));
  } catch (e) {
    return res.send(error(500, e.message));
  }
};
// Deleting My profie
const deleteMyProfile = async (req, res) => {
  try {
    const curUserId = req._id;
    const curUser = await User.findById(curUserId);

    // delete all posts
    await Post.deleteMany({
      owner: curUserId,
    });

    // removed myself from followers' followings
    curUser.followers.forEach(async (followerId) => {
      const follower = await User.findById(followerId);
      const index = follower.followings.indexOf(curUserId);
      follower.followings.splice(index, 1);
      await follower.save();
    });

    // remove myself from my followings' followers
    curUser.followings.forEach(async (followingId) => {
      const following = await User.findById(followingId);
      const index = following.followers.indexOf(curUserId);
      following.followers.splice(index, 1);
      await following.save();
    });

    // remove myself from all likes
    const allPosts = await Post.find();
    allPosts.forEach(async (post) => {
      const index = post.likes.indexOf(curUserId);
      post.likes.splice(index, 1);
      await post.save();
    });

    // delete user
    await curUser.deleteOne();

    res.clearCookie("jwt", {
      httpOnly: true,
      secure: true,
    });

    return res.send(success(200, "user deleted"));
  } catch (e) {
    console.log(e);
    return res.send(error(500, e.message));
  }
};
const updateMyProfile = async (req, res) => {
  try {
    const { name, bio, userImg } = req.body;
    const user = await User.findById(req._id);
    if (name) {
      user.name = name;
    }
    if (bio) {
      user.bio = bio;
    }
    if (userImg) {
      const cloudImg = await cloudinary.uploader.upload(userImg, {
        folder: "userProfileImg",
      });
      user.avatar = {
        publicId: cloudImg.public_id,
        url: cloudImg.secure_url,
      };
    }
    await user.save();
    return res.send(success(200, { user }));
  } catch (e) {
    return res.send(error(500, e.message));
  }
};
const getUserProfile = async (req, res) => {
  try {
    const userId = req.body.userId;
    const user = await User.findById(userId).populate({
      path: "posts",
      populate: {
        path: "owner",
      },
    });
    const fullPosts = user.posts;
    const posts = fullPosts
      .map((item) => mapPostOutput(item, req._id))
      .reverse();
    return res.send(success(200, { ...user._doc, posts }));
  } catch (e) {
    return res.send(error(500, e.message));
  }
};
module.exports = {
  followOrUnfollowUserController,
  getPostsOfFollowingController,
  getMyPost,
  getMyInfo,
  getUserPosts,
  deleteMyProfile,
  updateMyProfile,
  getUserProfile,
};
