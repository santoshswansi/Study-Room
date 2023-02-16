// api/study-groups controllers OR route handlers(MIDDLE-WARES)

const mongoose = require('mongoose')
const StudyGroupModel = require('../../models/Study Group Models/StudyGroupModel')
const StudyGroupContentModel = require("../../models/Study Group Models/StudyGroupContentModel");
const StudyGroupParticipantModel = require("../../models/Study Group Models/StudyGroupParticipantModel");

// @desc get all study groups
// @route GET /api/study-groups
// @access private
async function getStudyGroups(req, res, next) {
  const userId = req.userId;

  try{
    const studyGroupsParticipantForGroup = await StudyGroupParticipantModel.find({participants: {$elemMatch: {$eq: userId}}}).select({participantForGroup: 1, _id: 0})
    const studyGroupIds = studyGroupsParticipantForGroup.map(studyGroupParticipantForGroup => studyGroupParticipantForGroup.participantForGroup)
    const studyGroups = await StudyGroupModel.find({_id: {$in : studyGroupIds}}).select("-_id")

    res.status(200).json({studyGroups: studyGroups})
  }catch(err){
    res.status(500);
    console.log(err);
    next(new Error("Couldn't get study groups. Try again later"));
    return;
  }
}

// @desc get study group
// @route GET /api/study-groups/:studyGroupId
// @access private
async function getStudyGroup(req, res, next) {
  const studyGroupId = req.params.studyGroupId;
  const userId = req.userId;

  try {
    const studyGroup = await StudyGroupModel.findOne({
      _id: studyGroupId,
    })

    if (!studyGroup) {
      res.status(404);
      next(new Error("Study group not found"));
      return;
    }

    const studyGroupParticipant = await StudyGroupParticipantModel.findOne({
      participantForGroup: studyGroupId,
    })

    // user is not participant of the group of which details has been asked
    if(!studyGroupParticipant || !studyGroupParticipant.participants.includes(userId)){
      res.status(401);
      next(new Error("Unauthorized access"));
      return;
    }

    const studyGroupContent = await StudyGroupContentModel.findOne({
      contentForGroup: studyGroup._id,
    })

    res.status(200).json({
      name: studyGroup.name,
      subject: studyGroup.subject,
      createAt: studyGroup.createdAt,
      groupLeader: studyGroup.groupLeader,
      uniqueLink: studyGroup.uniqueLink,
      participants: studyGroupParticipant.participants,
      contents: studyGroupContent.contents
    });
     
  } catch (err) {
    res.status(500);
    console.log(err);
    next(new Error("Couldn't get study group details. Try again later"));
    return;
  }
}

// @desc update study group
// @route PUT /api/study-groups/:studyGroupId
// @access private
async function putStudyGroup(req, res, next) {
  const {name, subject} = req.body 
  const studyGroupId = req.params.studyGroupId
  const userId = req.userId

  if(!name && !subject){
    res.status(400)
    next(new Error('Updated values cannot be empty'))
    return 
  }
  
  try{
    const studyGroup = await StudyGroupModel.findOne({_id: studyGroupId})

    if(!studyGroup){
      res.status(404)
      next(new Error('Study group not found'))
      return 
    }

    if(name == studyGroup.name || await StudyGroupModel.exists({ name: name })) {
      res.status(400);
      next(new Error("Name of the group is already in use"));
      return;
    }

    const groupLeaderId = studyGroup.groupLeader._id.toString()
    if(groupLeaderId === userId){
      let updatedValue = {}
      if(name)
        updatedValue.name = name
      if(subject)
        updatedValue.subject = subject
      await StudyGroupModel.findOneAndUpdate({_id: studyGroupId}, updatedValue)
      res.status(200).json({message: "Study group details updated successfully"})
    }else{
      res.status(401)
      next(new Error('Unauthorized access'))
      return 
    }
  }catch(err){
    res.status(500)
    console.log(err)
    next(new Error("Couldn't update study group details. Try again later"))
    return 
  }
}

// @desc post study group (+ study group participant, + study group content)
// @route POST /api/study-groups
// @access private
async function postStudyGroup(req, res, next) {
  const id = req.userId;
  const { name, subject } = req.body;

  if (!name && !subject) {
    res.status(400);
    next(new Error("Name or subject cannot be empty"));
    return;
  }

  // MongoDB transaction(atomic operation --> consist of a set of operations)
  // using mongoose
  const session = await mongoose.startSession(); // creation a session
  try {
    if (await StudyGroupModel.exists({ name: name })) {
      res.status(400);
      next(new Error("Name of the group is already in use"));
      return;
    }

    session.startTransaction(); // start the transaction
    const studyGroup = await StudyGroupModel.create({
      name: name,
      subject: subject,
      groupLeader: id,
      uniqueLink: " ",
    });

    await StudyGroupModel.findOneAndUpdate({_id: studyGroup._id}, {uniqueLink: req.protocol + "://" + req.get("host") + "/study-groups/participants/add" + studyGroup._id})

    const studyGroupParticipant = await StudyGroupParticipantModel.create({
      participantForGroup: studyGroup._id,
      participants: [id],
    });

    const studyGroupContent = await StudyGroupContentModel.create({
      contentForGroup: studyGroup._id,
    });

    // commit the changes
    session.commitTransaction();
    res.status(200).json({ message: "Study group created successfully" });
  } catch (err) {
    // Rollback any changes made in the database
    await session.abortTransaction();
    res.status(500);
    console.log(err);
    next(new Error("Couldn't create study group"));
  }

  session.endSession(); // end the session
}

// @desc delete study group (+ study group participant, + study group content)
// @route DELETE /api/study-groups/:studyGroupId
// @access private
async function deleteStudyGroup(req, res, next) {
  const userId = req.userId;
  const studyGroupId = req.params.studyGroupId;

  const session = await mongoose.startSession(); // creation a session

  try {
    const studyGroup = await StudyGroupModel.findOne({ _id: studyGroupId });

    if (!studyGroup) {
      res.status(404);
      next(new Error("Can't find study group"));
      return;
    }

    const studyGroupContent = await StudyGroupContentModel.findOne({
      contentForGroup: studyGroup._id,
    });

    const studyGroupParticipant = await StudyGroupParticipantModel.findOne({
      participantForGroup: studyGroup._id,
    });

    session.startTransaction(); // start the transaction

    if (userId == studyGroup.groupLeader) {
      await StudyGroupModel.deleteOne({ _id: studyGroup._id });
      await StudyGroupContentModel.deleteOne({ _id: studyGroupContent._id });
      await StudyGroupParticipantModel.deleteOne({
        _id: studyGroupParticipant._id,
      });
    } else {
      session.endSession(); // end the session
      res.status(401);
      next(new Error("Unauthorized access"));
      return;
    }
    // commit the changes
    session.commitTransaction();
    res.status(200).json({message: "Study group deleted successfully"})
  } catch (err) {
    // Rollback any changes made in the database
    await session.abortTransaction();
    res.status(500);
    next(new Error("Can't delete study group"));
  }

  session.endSession(); // end the session
}

module.exports = { getStudyGroups, getStudyGroup, putStudyGroup, postStudyGroup, deleteStudyGroup }