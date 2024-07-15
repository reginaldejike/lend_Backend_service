const express = require("express");
const router = express.Router();
const userController = require("../controllers/usersControllers");

router
  .route("/")
  .get(userController.getAllUser)
  .post(userController.creatNewUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
