const express = require("express");
const router = express.Router();

const {
  addStudyGroupParticipant,
  removeStudyGroupParticipant,
} = require("../controllers/Study Group Controllers/studyGroupParticipantControllers");

// to protect routes (protect middleware)
const { protect } = require("../middlewares/authmiddlewares");

router.route("/add/:studyGroupId").post(protect, addStudyGroupParticipant);
router.route("/remove/:studyGroupId").delete(protect, removeStudyGroupParticipant);

module.exports = router;
