const mongoose = require('mongoose')

const studyGroupSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please add a study group name"],
  },
  subject: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: () => Date.now(),
    immutable: true,
  },
  groupLeader: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  uniqueLink: {
    type: String, 
    required: true
  }
});

// StudyGroup ---> studygroups is the name of the collection
const StudyGroupModel = mongoose.model('StudyGroup', studyGroupSchema)
module.exports = StudyGroupModel