const express = require("express");

const router = express.Router();

router.post("/api/listInstances", async (req, res) => {
  const { meeting_id } = req.body;
});

router.post("/api/initClass", async (req, res) => {
  const { meeting_id } = req.body;
});

router.post("/api/listStudents", async (req, res) => {
  const { meeting_id } = req.body;
});

router.post("/api/checkAttendance", async (req, res) => {
  const { instance_id } = req.body;
});

router.post("/api/removeStudent", async (req, res) => {
  const { meeting_id, student_id } = req.body;
});

module.exports = router;
