const express = require('express');
const app = express();
const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => res.send('API running'));
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));

// We can use 'node server.js' but it is better to add a script like this in package.json:
// "start": "node server", // This would be used in prod by heroku
// "server": "nodemon server" // This is actually our usage in dev, will refresh changes
// These can be executed with npm run script