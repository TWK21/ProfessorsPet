const express = require('express');

const PORT = 5420;

const app = express();
app.listen(PORT, () => console.log(`server running on port ${PORT}`));

app.use('/', express.static('dist'));
app.use(express.json());
