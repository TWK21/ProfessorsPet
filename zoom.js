const axios = require('axios');
const _ = require('lodash');

/*
listEndedMeetingInstances(token, meetingId)
  returns 
    [{
      uuid
      start_time
    }...]
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

    return data.meetings;
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
    const alphebetizedList = _.orderBy(data.participants, [part => part.name], ['desc']);

    return alphebetizedList;
  }
  catch (err) {
    throw err;
  }
}

// Module Exports

module.exports = {
  listEndedMeetingInstances,
  getPastMeetingParticipants
};