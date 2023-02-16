const express = require('express')
const router = express.Router()

const {getStudyGroup, getStudyGroups, postStudyGroup, putStudyGroup, deleteStudyGroup} = require('../controllers/Study Group Controllers/studyGroupControllers')
// to protect routes (protect middleware)
const {protect} = require("../middlewares/authmiddlewares")

router.route('/').get(protect, getStudyGroups).post(protect, postStudyGroup)
router.route('/:studyGroupId').get(protect, getStudyGroup).put(protect, putStudyGroup).delete(protect, deleteStudyGroup)

module.exports = router