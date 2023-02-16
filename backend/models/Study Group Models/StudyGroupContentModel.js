const mongoose = require('mongoose')

const studyGroupContentSchema = mongoose.Schema({
  contentForGroup: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "StudyGroup"
  },
  contents: {
    type: [
      {
        _id: {
          type: String,
          unique: true
        },
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        addedAt: {
          type: Date,
          default: () => Date.now(),
          immutable: true,
        },
        content: {
          type: String,
          required: [true, "Please add content"],
        },
      },
    ],
    default: [],
  },
})

const StudyGroupContentModel = mongoose.model("StudyGroupContent", studyGroupContentSchema)
module.exports = StudyGroupContentModel