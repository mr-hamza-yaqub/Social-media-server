const { success, error } = require("../Utils/responseWrapper");
const Post = require("../models/Post");
const User = require("../models/User");
const cloudinary = require("cloudinary").v2;
const { mapPostOutput } = require("../Utils/Utils");
// Create new Post
const createPostController = async (req, res) => {
  try {
    const { caption, postImg } = req.body;
    if (!caption || !postImg) {
      return res.send(error(400, "Post Image and Caption are  Required"));
    }

    const cloudImg = await cloudinary.uploader.upload(postImg, {
      folder: "postImg",
    });

    const owner = req._id;
    const user = await User.findById(req._id);
    const post = await Post.create({
      owner,
      caption,
      image: {
        publicId: cloudImg.public_id,
        url: cloudImg.secure_url,
      },
    });
    user.posts.push(post._id);
    await user.save();
    return res.send(success(201, post));
  } catch (e) {
    return res.send(error(500, e.message));
  }
};
// Like and UNlike Posts
const likeAndUnlikePost = async (req, res) => {
  try {
    const { postId } = req.body;
    const curUserId = req._id;
    const post = await Post.findById(postId).populate("owner");
    if (!post) {
      return res.send(error(404, "Post not Found!"));
    }
    // If Already like ( means cuuUserid Already includes in post.likes) splice it from Array
    if (post.likes.includes(curUserId)) {
      const index = post.likes.indexOf(curUserId);
      post.likes.splice(index, 1);
    } else {
      //if not liked push currUSerId in post.likes Array
      post.likes.push(curUserId);
    }
    await post.save();
    return res.send(success(200, { post: mapPostOutput(post, req._id) }));
  } catch (e) {
    return res.send(error(500, e.message));
  }
};
// Update post
const updatePostController = async (req, res) => {
  try {
    const { postId, caption } = req.body;
    const curUserId = req._id;
    const post = await Post.findById(postId);

    if (!post) {
      return res.send(error(404, "Post NOt Found"));
    }
    if (post.owner.toString() !== curUserId) {
      return res.send(error(403, "Only Owner Can Update his Post"));
    }
    if (caption) {
      post.caption = caption;
    }
    await post.save();
    return res.send(success(200, { post }));
  } catch (e) {
    return res.send(error(500, e.message));
  }
};

// Delete post
const deletePostController = async (req, res) => {
  try {
    const { postId } = req.body;
    const curUserId = req._id;
    const post = await Post.findById(postId);
    const curUser = await User.findById(curUserId);
    if (!post) {
      return res.send(error(404, "Post NOt Found"));
    }
    if (post.owner.toString() !== curUserId) {
      return res.send(error(403, "Only Owner Can Update his Post"));
    }
    // Removing Posts From Users Model Array
    const index = curUser.posts.indexOf(postId);
    curUser.posts.splice(index, 1);
    await curUser.save();
    await post.deleteOne();
    return res.send(success(200, "Post Deleted Successfully"));
  } catch (e) {
    return res.send(error(500, e.message));
  }
};
module.exports = {
  createPostController,
  likeAndUnlikePost,
  updatePostController,
  deletePostController,
};
