// importing necessary libraries
const express = require("express");

// importing functions from zoom.js
const { getDailyUsageReport } = require("./zoom.js");

const router = express.Router();

router.post("/api/getDailyUsageReport", async (req, res) => {
  const zoomToken = req.cookies.zoomToken;

  const reports = [];
  let currentMonth = new Date().getMonth() + 1;
  let currentYear = new Date().getFullYear();

  try {
    // get usage report over the past 6 months
    // for (let i = 6; i > 0; i--) {
    //   if (currentMonth - i > 0) {
    //     reports.push(
    //       await getDailyUsageReport(zoomToken, currentYear, currentMonth - i)
    //     );
    //   } else {
    //     reports.push(
    //       await getDailyUsageReport(
    //         zoomToken,
    //         currentYear - 1,
    //         12 + currentMonth - i
    //       )
    //     );
    //   }
    // }

    console.log(await getDailyUsageReport(zoomToken, 2020, 12));

    return res.send(JSON.stringify({ error_code: 0, reports }));
  } catch (err) {
    return res.send(JSON.stringify({ error_code: -1, error_message: err }));
  }
});

module.exports = router;
