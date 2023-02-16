const mongoose = require('mongoose')

const studyGroupParticipantSchema = mongoose.Schema({
  participantForGroup: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "StudyGroup",
  },
  participants: {
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User",
      },
    ],
  },
})

const StudyGroupParticipantModel = mongoose.model('StudyGroupParticipant', studyGroupParticipantSchema)
module.exports = StudyGroupParticipantModel