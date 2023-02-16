const StudyGroupContentModel = require("../../models/Study Group Models/StudyGroupContentModel");
const StudyGroupModel = require("../../models/Study Group Models/StudyGroupModel");
const StudyGroupParticipantModel = require("../../models/Study Group Models/StudyGroupParticipantModel");

// @desc add participant to a study group
// @route POST /study-groups/participants/add/:studyGroupId
// @access private
async function addStudyGroupParticipant(req, res, next) {
  const userId = req.userId;
  const studyGroupId = req.params.studyGroupId;

  try {
    const studyGroup = await StudyGroupModel.findOne({ _id: studyGroupId });

    if (!studyGroup) {
      res.status(404);
      next(new Error("Study group not found"));
      return;
    }

    const participants = await StudyGroupParticipantModel.findOne({
      participantForGroup: studyGroupId,
      participants: userId,
    }).select("participants -_id");

    if(participants == null) {
      await StudyGroupParticipantModel.findOneAndUpdate(
        { participantForGroup: studyGroup._id },
        { $push: { participants: userId } }
      );
    } else {
      
      // participant already exist
      res.status(409);
      next(new Error("Participant already exist"));
      return;
    }
    res
      .status(200)
      .json({ message: "Participant added to the study group successfully" });
  } catch (err) {
    res.status(500);
    console.log(err);
    next(new Error("Couldn't add participant to the study group"));
  }
}

// @desc remove participant from a study group
// @route DELETE /study-groups/participants/remove/:studyGroupId
// @access private
async function removeStudyGroupParticipant(req, res, next) {
  const userId = req.userId;
  const studyGroupId = req.params.studyGroupId;

  try {
    const studyGroup = await StudyGroupModel.findOne({ _id: studyGroupId });

    if (!studyGroup) {
      res.status(404);
      next(new Error("Study group not found"));
      return;
    }

    if(studyGroup.groupLeader == userId){
      res.status(400)
      next(new Error("Study group leader cannot be deleted"));
      return
    }

    if (
      await StudyGroupParticipantModel.exists({
        participantForGroup: studyGroupId,
        participants: userId,
      })
    ) {
      await StudyGroupParticipantModel.findOneAndUpdate(
        { participantForGroup: studyGroupId },
        { $pull: { participants: userId } }
      );
    } else {
      res.status(400);
      next(new Error("Participant is not a part of the study group"));
      return;
    }

    res
      .status(200)
      .json({ message: "Participant removed from the study group successfully" });
  
    } catch (err) {
    res.status(500);
    console.log(err);
    next(new Error("Couldn't remove participant from the study group"));
  }
}

module.exports = {
  addStudyGroupParticipant,
  removeStudyGroupParticipant,
};
