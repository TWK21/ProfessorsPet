const express = require('express');
const axios = require('axios');
const cookieParser = require('cookie-parser');
const qs = require('qs');

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const PORT = 5420;

// Express

const app = express();
app.listen(PORT, () => console.log(`server running on port ${PORT}`));

app.use('/', express.static('dist'));
app.use(express.json());

// Zoom OAuth

app.get('/redirect', async (req, res) => {
	if (req.query.code) {
		const url = 'https://zoom.us/oauth/token';
		const params = {
			grant_type: 'authorization_code',
			code: req.query.code,
			redirect_uri: 'https://zoom.piyo.cafe/redirect'
		};
		const config = {
			headers: {
				Authorization: `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')}`
			}
		};
		try {
			const { data } = await axios.post(url, qs.stringify(params), config);
			res.cookie('zoomToken', data.access_token);
			res.redirect('/app');
		}
		catch (err) {
			console.error(err);
		}
	} 
});

// Zoom API
