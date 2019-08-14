const dotenv = require('dotenv');
dotenv.config();
module.exports = {
  MONGODB_URI: process.env.MONGODB_URI,
  CLIENT_ID: process.env.CLIENT_ID,
  CLIENT_SECRET: process.env.CLIENT_SECRET,
  SESSION_SECRET: process.env.SESSION_SECRET
};