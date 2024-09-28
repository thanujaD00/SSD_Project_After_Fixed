require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const helmet = require('helmet');
const rateLimit = require("express-rate-limit");
const passport = require('passport');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const path = require('path');

const authRoutes = require('./routes/userRoutes');
const courseRouter = require('./routes/courses');
const tutorialRouter = require('./routes/tutorials');
const postRoutes = require('./routes/postRoutes');
const commentRoutes = require('./routes/commentRoutes');

const { routsInit } = require('./controllers/auth.google');
const googleAuth = require('./google.auth');

const app = express();

const PORT = process.env.PORT || 8080;

// Enhanced security headers
// app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS.split(','),
  optionsSuccessStatus: 200
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use(limiter);

// HTTPS redirect (uncomment in production)
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      res.redirect(`https://${req.header('host')}${req.url}`);
    } else {
      next();
    }
  });
}

app.use(bodyParser.json());

const URI = process.env.MONGODB_URL;

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: URI,
    ttl: 24 * 60 * 60 // 1 day
  }),
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 1 day
  }
}));

app.use(passport.initialize());
app.use(passport.session());
// routsInit(app);

// MongoDB connection with enhanced error handling
mongoose.connect(URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000 // 5 seconds timeout
}).then(() => {
  console.log('Connected to MongoDB');
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    routsInit(app, passport)
    googleAuth(passport)
    // Uncommented this line
  });
}).catch((error) => {
  console.error("Error connecting to MongoDB:", error);
  process.exit(1); // Exit the process if unable to connect to the database
});



// Routes
app.use('/auth', authRoutes);
app.use('/courses', courseRouter);
app.use('/tutorials', tutorialRouter);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);

// Serve static files
app.use('/TuteFiles', express.static(path.join(__dirname, 'TuteFiles'), {
  dotfiles: 'deny',
  index: false,
}));

// Enhanced global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    error: {
      message: err.message || 'Internal Server Error',
      stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack
    }
  });
});

module.exports = app;