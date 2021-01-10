const axios = require('axios');
const _ = require('lodash');

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
*/

async function listEndedMeetingInstances(token, meetingId) {
  try {
    const url = `https://api.zoom.us/v2/past_meetings/${meetingId}/instances`;
    const config = {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
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
    }
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
    const url = `https://api.zoom.us/v2/past_meetings/me/participants`;
    const config = {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
    const { data } = await axios.get(url, config);

    const { id, first_name, last_name, pic_url } = data;
    return { id, first_name, last_name, pic_url };
  }
  catch (err) {
    throw err;
  }
}
// Module Exports

module.exports = {
  listEndedMeetingInstances,
  getPastMeetingParticipants,
  getUser
};