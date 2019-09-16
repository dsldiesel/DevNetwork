// Express, Node
const express = require('express');
const app = express();
const PORT = process.env.PORT || 5000;
const path = require('path');
// DB
const connectDB = require('./config/db');
connectDB();
// Middleware
// Body parser, permits to use req.body and so
// app.use(bodyParser.urlencoded({ extended: false }));
// app.use(bodyParser.json());
// Newly, without requiring package:
app.use(express.json({ extended: false }));

// Imports (this require may well go in the app.use sentence)
const userRoutes = require('./routes/api/users');
const profileRoutes = require('./routes/api/profile');
const postsRoutes = require('./routes/api/posts');
const authRoutes = require('./routes/api/auth');

// Routes
app.use('/api/users', userRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/posts', postsRoutes);
app.use('/api/auth', authRoutes);

// Test root GET route (only for DEV, disable for serving on prod)
// app.get('/', (req, res) => res.send('API running'));

// Serve static assets in prod
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  app.use(express.static('client/build'));
  // Serve
  app.get('*', (req, res) =>
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'))
  );
}

// Listen
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));

// We can use 'node server.js' but it is better to add a script like this in package.json:
// "start": "node server", // This would be used in prod by heroku
// "server": "nodemon server" // This is actually our usage in dev, will refresh changes
// These can be executed with npm run script
