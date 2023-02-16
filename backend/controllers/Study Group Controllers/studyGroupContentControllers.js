const StudyGroupContentModel = require("../../models/Study Group Models/StudyGroupContentModel");
const StudyGroupModel = require("../../models/Study Group Models/StudyGroupModel");
const StudyGroupParticipantModel = require("../../models/Study Group Models/StudyGroupParticipantModel");
const { v4: uuidv4 } = require("uuid");

// @desc add content to a study group
// @route POST /study-groups/contents/add/:studyGroupId
// @access private
async function addStudyGroupContent(req, res, next) {
  const userId = req.userId;
  const studyGroupId = req.params.studyGroupId;
  const { content } = req.body;

  if (!content) {
    res.status(400);
    next(new Error("Content cannot be empty"));
    return;
  }

  try {
    const studyGroup = await StudyGroupModel.findOne({_id: studyGroupId})

    if(!studyGroup) {
      res.status(404)
      next(new Error("Study group not found"))
      return
    }

    const participants = await StudyGroupParticipantModel.findOne({participantForGroup: studyGroupId, participants: userId}).select("participants -_id")  
    if(participants != null){
      await StudyGroupContentModel.findOneAndUpdate({contentForGroup: studyGroup._id}, {$push: {contents: {_id: uuidv4(), user: userId, content: content}}})
    }else{
      res.status(401);
      next(new Error("Unauthorized access"));
      return;
    }
    res.status(200)
      .json({ message: "Content added to the study group successfully" });
  } catch (err) {
    res.status(500);
    console.log(err);
    next(new Error("Couldn't add content to the study group"));
  }
}

// @desc remove content from a study group
// @route DELETE /study-groups/contents/remove/:studyGroupId/:contentId
// @access private
async function removeStudyGroupContent(req, res, next) {
  const userId = req.userId;
  const studyGroupId = req.params.studyGroupId;
  const contentId = req.params.contentId;

  try {
    const studyGroup = await StudyGroupModel.findOne({_id: studyGroupId})

    if(!studyGroup) {
      res.status(404)
      next(new Error("Study group not found"))
      return
    }

    const content = await StudyGroupContentModel.findOne({contentForGroup: studyGroupId}).select({contents: {$elemMatch: {_id: contentId}}, _id: 0});
    if (content.contents.length == 0) {
      res.status(404);
      next(new Error("Content not found"));
      return;
    }

    if(await StudyGroupParticipantModel.exists({participantForGroup: studyGroupId, participants: userId})){
      await StudyGroupContentModel.findOneAndUpdate({contentForGroup: studyGroupId }, {$pull: {contents: {_id: contentId}}})
      res.status(200).json({
        message: "Content removed from the study group successfully",
      });
    }else{
      res.status(401);
      next(new Error("Unauthorized access"));
      return;
    }
  } catch (err) {
    res.status(500);
    console.log(err);
    next(new Error("Couldn't remove content from the study group"));
  }
}

module.exports = {
  addStudyGroupContent,
  removeStudyGroupContent,
};
