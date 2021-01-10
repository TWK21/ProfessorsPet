// importing necessary libraries
const express = require("express");

// importing functions from zoom.js
const { listAllRecordings, getMeetingRecordingSettings } = require("./zoom.js");

const router = express.Router();

module.exports = router;
