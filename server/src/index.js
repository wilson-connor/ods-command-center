const express = require('express');
const session = require('express-session');

const morgan = require('morgan');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { router } = require('./routes');

const logger = (req, res, next) => {
  console.log(req.session);
  next();
};

const app = express();

app.use(cors());

app.use(express.json());

app.use(morgan('tiny'));

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    isAuthenticated: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24,
    },
  }),
);
/* Note: the current implementation for session storage uses express-session's in-memory storage.
The documentation recommends using a separate store. The list of supported options can be found
here: https://www.npmjs.com/package/express-session */

app.use(logger);

app.use('/api', router);

app.use(express.static(path.join(__dirname, '../../client/build')));
app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../client/build/index.html'));
});

app.use((err, req, res, next) => {
  console.log(res.statusCode, err);
  if (res.statusCode == 400) {
    res.json({ error: true, message: 'Bad Request' });
    return;
  }
  if (res.statusCode === 401) {
    res.json({ error: true, message: 'Unauthorized' });
  }
  if (res.statusCode === 404) {
    res.json({ error: true, message: 'not found' });
  }
  res.status(500).json({ error: true, message: 'something went wrong' });
});

let port = process.env.PORT;
if (port == null || port == '') {
  port = 3009;
}

app.listen(port, () => {
  console.log('up and running', port);
});
