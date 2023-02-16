const express = require("express");
const router = express.Router();

const {
  addStudyGroupContent,
  removeStudyGroupContent,
} = require("../controllers/Study Group Controllers/studyGroupContentControllers");
// to protect routes (protect middleware)s
const { protect } = require("../middlewares/authmiddlewares");

router.route("/add/:studyGroupId").post(protect, addStudyGroupContent)
router.route("/remove/:studyGroupId/:contentId").delete(protect, removeStudyGroupContent);

module.exports = router;
