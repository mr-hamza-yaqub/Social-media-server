const router = require("express").Router();
const requireUser = require("../middlerwares/requireUser");
const userController = require("../controllers/userController");
router.post(
  "/follow",
  requireUser,
  userController.followOrUnfollowUserController
);
router.get(
  "/getFeedData",
  requireUser,
  userController.getPostsOfFollowingController
);
router.get("/getMyPost", requireUser, userController.getMyPost);
router.get("/getMyInfo", requireUser, userController.getMyInfo);
router.get("/getUserPosts", requireUser, userController.getUserPosts);
router.delete("/", requireUser, userController.deleteMyProfile);
router.put("/", requireUser, userController.updateMyProfile);
router.post("/getUserProfile", requireUser, userController.getUserProfile);
module.exports = router;
