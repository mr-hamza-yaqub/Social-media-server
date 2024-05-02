const router = require("express").Router();
const authController = require("../controllers/authControler");
router.post("/signup", authController.signUpController);
router.post("/login", authController.loginController);
router.post("/logout", authController.logoutController);
router.get("/refresh", authController.refreshAccessTokenController);

module.exports = router;
