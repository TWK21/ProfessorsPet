const express = require("express");
const axios = require("axios");
const cookieParser = require("cookie-parser");
const qs = require("qs");
const { google } = require('googleapis');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

const attendanceRoutes = require("./attendanceRoutes.js");
const recordingRoutes = require("./recordingRoutes.js");

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const PORT = 5420;

// Express

const app = express();
app.listen(PORT, () => console.log(`server running on port ${PORT}`));

app.use("/", express.static("dist"));
app.use(express.json());
app.use(cookieParser());
app.use(attendanceRoutes);
app.use(recordingRoutes);

// Zoom OAuth

app.get("/redirect", async (req, res) => {
  if (req.query.code) {
    const url = "https://zoom.us/oauth/token";
    const params = {
      grant_type: "authorization_code",
      code: req.query.code,
      redirect_uri: "https://zoom.piyo.cafe/redirect",
    };
    const config = {
      headers: {
        Authorization: `Basic ${Buffer.from(
          `${CLIENT_ID}:${CLIENT_SECRET}`
        ).toString("base64")}`,
      },
    };
    try {
      const { data } = await axios.post(url, qs.stringify(params), config);
      res.cookie("zoomToken", data.access_token);
      res.redirect("/app");
    } 
    catch (err) {
      throw err;
    }
  }
});

// Google OAuth

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REDIRECT_URL = "https://zoom.piyo.cafe/redirect";

const oauth2Client = new google.auth.OAuth2(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URL
);

google.options({auth: oauth2Client});

const scopes = [
  'https://www.googleapis.com/auth/classroom.courseworkmaterials'
];

const url = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: scopes
});

const adapter = new FileSync('GoogleTokens.json');
const db = low(adapter);

db.defaults({ refresh_tokens: [] }).write();

app.get('/googleRedirect', async (req, res) => {
  if (req.query.code) {
    const { tokens } = await oauth2Client.getToken(req.query.code);
    oauth2Client.setCredentials(tokens);
  }
});
