// importing necessary libraries
const express = require("express");

// importing functions from zoom.js
const {
  listAllRecordings,
  getMeetingRecordingPassword,
  getPastMeetingDetails,
} = require("./zoom.js");

const router = express.Router();

router.post("/api/listAllRecordings", async (req, res) => {
  const { instance_id } = req.body;
  const zoomToken = req.cookies.zoomToken;

  if (!instance_id) return res.send(JSON.stringify({ error_code: 1 }));

  try {
    let { start_time, end_time } = await getPastMeetingDetails(
      zoomToken,
      instance_id
    );
    start_time = start_time.substring(0, start_time.indexOf("T"));
    end_time = end_time.substring(0, end_time.indexOf("T"));

    const recordings = await listAllRecordings(zoomToken, start_time, end_time);

    for (recording of recordings) {
      if (recording.uuid == instance_id)
        return res.send(
          JSON.stringify({
            error_code: 0,
            recording_urls: recording.recording_urls,
          })
        );
    }
    return res.send(JSON.stringify({ error_code: 7 }));
  } catch (err) {
    // return res.send(JSON.stringify({ error_code: -1, error_message: err }));
    return console.log(err);
  }
});

router.post("/api/getMeetingRecordingPassword", async (req, res) => {
  const { instance_id } = req.body;
  const zoomToken = req.cookies.zoomToken;

  if (!instance_id) return res.send(JSON.stringify({ error_code: 1 }));

  // returns password requires to play the video
  const password = await getMeetingRecordingPassword(zoomToken, instance_id);
  return res.send(JSON.stringify({ error_code: 0, password }));
});

module.exports = router;
