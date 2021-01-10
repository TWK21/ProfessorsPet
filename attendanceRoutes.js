// importing necessary libraries
const express = require("express");

const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");

const adapter = new FileSync("db.json");
const db = low(adapter);

// importing functions from zoom.js
const {
  listEndedMeetingInstances,
  getPastMeetingParticipants,
  getUser,
} = require("./zoom.js");

db.defaults({ classes: [] }).write();

const router = express.Router();

router.post("/api/listInstances", async (req, res) => {
  const { meeting_id } = req.body;
  if (!meeting_id) return res.send(JSON.stringify({ error_code: 1 }));

  try {
    // use function to get an array of {instance_id, timestamp}
    const meeting_instances = await listEndedMeetingInstances(
      req.cookies.zoomToken,
      meeting_id
    );

    // if meeting has no instance error_code: 3
    if (meeting_instances.length == 0)
      return res.send(JSON.stringify({ error_code: 3 }));

    // if success
    res.send(JSON.stringify({ error_code: 0, meeting_instances }));
  } catch (err) {
    // if meeting does not exist, return error_code: 2
    return res.send(JSON.stringify({ error_code: -1, error_message: err }));
  }
});

router.post("/api/initClass", async (req, res) => {
  const { meeting_id } = req.body;
  const zoomToken = req.cookies.zoomToken;
  const owner = getUser(zoomToken).id;

  if (!meeting_id) return res.send(JSON.stringify({ error_code: 1 }));

  try {
    // if class already exists return error_code: 5
    const existingClass = db.get("classes").find({ id: meeting_id }).value();
    if (existingClass) return res.send(JSON.stringify({ error_code: 5 }));

    // if no instance return error_code: 3 else find latest instance_id from the meeting_id
    const meeting_instances = await listEndedMeetingInstances(
      zoomToken,
      meeting_id
    );
    if (meeting_instances.length == 0)
      return res.send(JSON.stringify({ error_code: 3 }));

    const last_meeting_instance = meeting_instances[4].uuid;

    // get array of students that were in the last instance of the meeting_id
    const students = await getPastMeetingParticipants(
      zoomToken,
      last_meeting_instance
    );

    // add the class to database
    db.get("classes")
      .push({
        id: meeting_id,
        owner,
        students,
      })
      .write();

    return res.send(JSON.stringify({ error_code: 0 }));
  } catch (err) {
    return res.send(JSON.stringify({ error_code: -1, error_message: err }));
  }
});

router.post("/api/listStudents", async (req, res) => {
  const { meeting_id } = req.body;
  if (!meeting_id) return res.send(JSON.stringify({ error_code: 1 }));

  // check if the class exists and if it doesn't return error_code: 6
  const existingClass = db.get("classes").find({ id: meeting_id });
  if (existingClass.value().length == 0)
    return res.send(JSON.stringify({ error_code: 6 }));

  // finding the array of students with meeting_id
  const students = existingClass.get("students").value();

  return res.send(JSON.stringify({ error_code: 0, students }));
});

router.post("/api/checkAttendance", async (req, res) => {
  const { meeting_id, instance_id } = req.body;
  const zoomToken = req.cookies.zoomToken;

  if (!meeting_id || !instance_id)
    return res.send(JSON.stringify({ error_code: 1 }));

  // finding students from db
  const students = db
    .get("classes")
    .find({ id: meeting_id })
    .get("students")
    .value();

  try {
    // use function getParticipants() to get students at the meeting with instance_id
    const participants = await getPastMeetingParticipants(
      zoomToken,
      instance_id
    );

    // collapse array of objects into an array of IDs to be able to use .includes()
    const studentIDs = students.map((student) => student.id);
    const participantIDs = participants.map((participant) => participant.id);

    // find present, absent, uncategorized student IDs
    const uncategorized_studentIDs = [];
    const absent_studentIDs = [];
    const present_studentIDs = [];
    participantIDs.forEach((participantID) =>
      studentIDs.includes(participantID)
        ? present_studentIDs.push(participantID)
        : uncategorized_studentIDs.push(participantID)
    );
    studentIDs.forEach((studentID) =>
      present_studentIDs.includes(studentID)
        ? null
        : absent_studentIDs.push(studentID)
    );

    // build array of IDs back into array of objects
    const uncategorized_students = [];
    const absent_students = [];
    const present_students = [];
    participants.forEach((participant) => {
      if (present_studentIDs.includes(participant.id))
        present_students.push(participant);
      else uncategorized_students.push(participant);
    });
    students.forEach((student) => {
      if (absent_studentIDs.includes(student.id)) absent_students.push(student);
    });

    return res.send(
      JSON.stringify({
        error_code: 0,
        present_students,
        absent_students,
        uncategorized_students,
      })
    );
  } catch (err) {
    return res.send(JSON.stringify({ error_code: -1, error_message: err }));
  }
});

router.post("/api/removeStudent", async (req, res) => {
  const { meeting_id, student_id } = req.body;
  if (!meeting_id || !student_id)
    return res.send(JSON.stringify({ error_code: 1 }));

  const student = db
    .get("classes")
    .find({ id: meeting_id })
    .get("students")
    .find({ id: student_id })
    .value();

  if (student) {
    // REMOVE A STUDENT
    db.get("classes")
      .find({ id: meeting_id })
      .get("students")
      .remove({ id: student_id })
      .write();
    return res.send(JSON.stringify({ error_code: 0 }));
  } else {
    return res.send(JSON.stringify({ error_code: 4 }));
  }
});

router.post("/api/getUser", async (req, res) => {
  const zoomToken = req.cookies.zoomToken;

  try {
    const user = await getUser(zoomToken);

    return res.send(
      JSON.stringify({
        error_code: 0,
        user_id: user.id,
        name: `${user.first_name} ${user.last_name}`,
        profile_picture: user.pic_url,
      })
    );
  } catch (err) {
    return res.send(JSON.stringify({ error_code: -1, error_message: err }));
  }
});

module.exports = router;
