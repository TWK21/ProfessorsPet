const axios = require('axios');

async function listEndedMeetingInstances(meetingId) {
	if (req.cookies.zoomToken) {
		try {
			const url = `https://api.zoom.us/v2/past_meetings/${meetingId}/participants`;
			const config = {
				headers: {
					Authorization: `Bearer ${req.cookies.zoomToken}`
				}
			}
			const { data } = await axios.get(url, config);
			return data;
		}
		catch (err) {
			throw new Error('listEndedMeetingInstances error');
		}
	}
}

// Module Exports

module.exports = {
	listEndedMeetingInstances
};