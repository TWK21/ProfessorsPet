const express = require("express");

const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");

const adapter = new FileSync("db.json");
const db = low(adapter);

db.defaults({ classes: [] }).write();

const router = express.Router();

router.post("/api/listInstances", async (req, res) => {
  const { meeting_id } = req.body;
  //if(!meeting_id) return res.send(JSON.stringify({error_code: 1}))

  // use function to get an array of {instance_id, timestamp}
  // const  meeting_instances = <getMeetingInstances function>

  // if meeting does not exist, return res.send(JSON.stringify({error_code: 2}))
  // if array.length == 0 (no instance) return res.send(JSON.stringify({error_code: 3}))

  // res.send(JSON.stringify({error_code: 0, meeting_instances: meeting_instances}))
});

router.post("/api/initClass", async (req, res) => {
  const { meeting_id } = req.body;
  //if(!meeting_id) return res.send(JSON.stringify({error_code: 1}))

  // use function to get array of students that were in the last instance of the meeting_id
  // const students = <getStudent function>

  // format students[] into {id, name}

  // ***if array.length == 0 (no instance) return res.send(JSON.stringify({error_code: 3}))

  // ADD A CLASS TO DB
  // db.get("classes")
  //   .push({
  //     id: meeting_id,
  //     owner: <req.cookies>,
  //     students: students,
  //   })
  //   .write();

  // return res.send(JSON.stringify({error_code: 0}))
});

router.post("/api/listStudents", async (req, res) => {
  const { meeting_id } = req.body;
  //if(!meeting_id) return res.send(JSON.stringify({error_code: 1}))

  // finding the array of students with meeting_id
  // const students = db.get("classes").find({ id: meeting_id }).get("students").value()
  // return res.send(JSON.stringify({error_code: 0, students:students}))
});

router.post("/api/checkAttendance", async (req, res) => {
  const { instance_id } = req.body;
  //if(!meeting_id) return res.send(JSON.stringify({error_code: 1}))

  // finding students from db
  // const students = db.get("classes").find({ id: meeting_id }).get("students").value()

  // use function getParticipants() to get students at the meeting with instance_id
  // participants = getParticipants()

  // map through each participant from participants variable:
  //    if in the database --> present_students[]
  //    if NOT in the database --> uncategorized_students[]
  //    if in the database but not in participants --> absent_students[]

  // return res.send(JSON.stringify({ error_code: 0, present_students, absent_students, uncategorized_students}))
});

router.post("/api/removeStudent", async (req, res) => {
  const { meeting_id, student_id } = req.body;
  //if(!meeting_id || !student_id) return res.send(JSON.stringify({error_code: 1}))

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

module.exports = router;
