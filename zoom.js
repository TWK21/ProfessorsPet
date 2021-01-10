const axios = require('axios');
const _ = require('lodash');
const qs = require('qs');

/*
listEndedMeetingInstances(token, meetingId)
  returns 
    [{
      uuid
      start_time
    }...]

getPastMeetingParticipants(token, meetingUUID)
  returns
    [{
      id
      name
      user_email
    }...]

getUser(token)
  returns
    {
      id, 
      first_name, 
      last_name, 
      pic_url
    }

listAllRecordings(token, from, to) - from/to = 'yyyy-mm-dd' UTC format - max range: 1 month
  returns
    [{
      uuid - meetingUUID,
      recording_urls
        [{
          url,
          recording_type,
          recording_start,
          recording_end
        }...]
    }...]

getMeetingRecordingPassword(token, meetingUUID) - make sure recordings exist in meetinguuid
  returns
    password

getPastMeetingDetails(token, meetingUUID)
  returns
    {
      start_time,
      end_time
    }

getDailyUsageReport(token, year, month)
  returns
    [{
      participants,
      meeting_minutes
    }...]

getMeetingPassword(token, meetingId)
  returns
    password

getMeetingInvitation(token, meetingId)
  returns
    invitation
*/

async function listEndedMeetingInstances(token, meetingId) {
  try {
    const url = `https://api.zoom.us/v2/past_meetings/${meetingId}/instances`;
    const config = {
      headers: {
        Authorization: `Bearer ${token}`
      }
    };
    const { data } = await axios.get(url, config);

    const meetingsSortedByDate = data.meetings.sort((a, b) => new Date(a.start_time) < new Date(b.start_time) ? 1 : -1);

    return meetingsSortedByDate;
  }
  catch (err) {
    throw err;
  }
}

async function getPastMeetingParticipants(token, meetingUUID) {
  try {
    const encodedUUID = encodeURIComponent(encodeURIComponent(meetingUUID));
    const url = `https://api.zoom.us/v2/past_meetings/${encodedUUID}/participants`;
    const config = {
      headers: {
        Authorization: `Bearer ${token}`
      }
    };
    const { data } = await axios.get(url, config);

    const participants = data.participants.filter((participant, index, self) => index === self.findIndex((t) => ( t.id === participant.id )));
    const alphabetizedList = _.orderBy(participants, [part => part.name], ['asc']);

    return alphabetizedList;
  }
  catch (err) {
    throw err;
  }
}

async function getUser(token) {
  try {
    const url = `https://api.zoom.us/v2/users/me`;
    const config = {
      headers: {
        Authorization: `Bearer ${token}`
      }
    };
    const { data } = await axios.get(url, config);

    const { id, first_name, last_name, pic_url } = data;
    return { id, first_name, last_name, pic_url };
  }
  catch (err) {
    throw err;
  }
}

async function listAllRecordings(token, _from, _to) {
  try {
    const url = `https://api.zoom.us/v2/users/me/recordings`;
    const config = {
      headers: {
        Authorization: `Bearer ${token}`
      },
      params: {
        from: _from,
        to: _to
      }
    };
    const { data } = await axios.get(url, config);

    let meetings = [];
    for (meeting of data.meetings) {
      let recFiles = [];
      for (recFile of meeting.recording_files) {
        recFiles.push({
          url: recFile.play_url,
          recording_type: recFile.recording_type,
          recording_start: recFile.recording_start,
          recording_end: recFile.recording_end
        });
      }
      meetings.push({
        uuid: meeting.uuid,
        recording_urls: recFiles
      });
    }

    return meetings;
  }
  catch (err) {
    throw err;
  }
}

async function getMeetingRecordingPassword(token, meetingUUID) {
  try {
    const encodedUUID = encodeURIComponent(encodeURIComponent(meetingUUID));
    const url = `https://api.zoom.us/v2/meetings/${encodedUUID}/recordings/settings`;
    const config = {
      headers: {
        Authorization: `Bearer ${token}`
      }
    };
    const { data } = await axios.get(url, config);

    return data.password;
  }
  catch (err) {
    throw err;
  }
}

async function getPastMeetingDetails(token, meetingUUID) {
  try {
    const encodedUUID = encodeURIComponent(encodeURIComponent(meetingUUID));
    const url = `https://api.zoom.us/v2/past_meetings/${encodedUUID}`;
    const config = {
      headers: {
        Authorization: `Bearer ${token}`
      }
    };
    const { data } = await axios.get(url, config);

    const { start_time, end_time } = data;
    return { start_time, end_time };
  }
  catch (err) {
    throw err;
  }
}

async function getDailyUsageReport(token, year, month) {
  try {
    const url = `https://api.zoom.us/v2/report/daily`;
    const config = {
      headers: {
        Authorization: `Bearer ${token}`
      },
      params: {
        year,
        month
      }
    };
    const { data } = await axios.get(url, config);

    let dates = []
    for (date of data.dates) {
      dates.push({
        participants: date.participants,
        meeting_minutes: date.meeting_minutes
      });
    }
    return dates;
  }
  catch (err) {
    throw err;
  }
}

async function getMeetingPassword(token, meetingId) {
  try {
    const url = `https://api.zoom.us/v2/meetings/${meetingId}`;
    const config = {
      headers: {
        Authorization: `Bearer ${token}`
      }
    };
    const { data } = await axios.get(url, config);

    return data.password;
  }
  catch (err) {
    throw err;
  }
}

async function getMeetingInvitation(token, meetingId) {
  try {
    const url = `https://api.zoom.us/v2/meetings/${meetingId}/invitation`;
    const config = {
      headers: {
        Authorization: `Bearer ${token}`
      }
    };
    const { data } = await axios.get(url, config);

    const temp = data.invitation.substring(data.invitation.indexOf('https'));
    const link = temp.substring(0, temp.indexOf('\n'));

    return link;
  }
  catch (err) {
    throw err;
  }
}

// Module Exports

module.exports = {
  listEndedMeetingInstances,
  getPastMeetingParticipants,
  getUser,
  listAllRecordings,
  getMeetingRecordingPassword,
  getPastMeetingDetails,
  getDailyUsageReport,
  getMeetingPassword,
  getMeetingInvitation
};