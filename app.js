const express = require('express');
const request = require('request');
const cors = require('cors');
const querystring = require('querystring');
const cookieParser = require('cookie-parser');
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId
const sanitize = require('mongo-sanitize');
const session = require('express-session');

const mongodb_uri = process.env.MONGODB_URI || "mongodb://localhost:27017/Brackit"; // Mongodb URI
const mongodb_db = process.env.MONGODB_DB; // Database name
const client_id = process.env.CLIENT_ID; // Spotify client id
const client_secret = process.env.CLIENT_SECRET; // Spotify client secret
const redirect_uri = 'https://letsbrackit.herokuapp.com/callback'; // Redirect uri

/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
var generateRandomString = function (length) {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

var stateKey = 'spotify_auth_state';

var app = express();

app.use(express.json());

app.use(express.static(__dirname + '/public'))
  .use(cors())
  .use(cookieParser());

app.use((err, req, res, next) => {
  // body-parser will set this to 400 if the json is in error
  if (err.status === 400)
    return res.status(err.status).send('Bracket must be JSON-formatted');

  return next(err); // if it's not a 400, let the default error handling do it. 
});

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));

var sesh;

app.get('/login', function (req, res) {
  var state = generateRandomString(16);
  res.cookie(stateKey, state);

  // your application requests authorization
  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: client_id,
      redirect_uri: redirect_uri,
      state: state
    }));
});

app.get('/callback', function (req, res) {
  // your application requests refresh and access tokens
  // after checking the state parameter

  var code = req.query.code || null;
  var state = req.query.state || null;
  var storedState = req.cookies ? req.cookies[stateKey] : null;

  if (state === null || state !== storedState) {
    res.redirect('/#' +
      querystring.stringify({
        error: 'state_mismatch'
      }));
  } else {
    res.clearCookie(stateKey);
    var authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code: code,
        redirect_uri: redirect_uri,
        grant_type: 'authorization_code'
      },
      headers: {
        'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
      },
      json: true
    };

    request.post(authOptions, function (error, response, body) {
      if (!error && response.statusCode === 200) {
        // lagra tokens i session
        sesh = req.session;
        sesh.access_token = body.access_token;
        sesh.refresh_token = body.refresh_token;

        // Skicka oss till /authenticated
        res.redirect('/authenticated');
      } else {
        res.redirect('/#' +
          querystring.stringify({
            error: 'invalid_token'
          }));
      }
    });
  }
});

app.get('/data', function (req, res) {
  res.sendFile(__dirname + '/public/data.html');
});

app.get('/data/statistics', function (req, res) {
  MongoClient.connect(mongodb_uri, { useNewUrlParser: true }, function (err, client) {
    if (err)
      throw err;
    
    var db = client.db(mongodb_db);
    var brackets = db.collection("Brackets");

    brackets.aggregate([
      {
        '$group': {
          '_id': '$artist',
          'pfp': {
            '$addToSet': '$pfp'
          },
          'nBrackets': {
            '$sum': 1
          },
          'latest': {
            '$last': '$date'
          },
          'winningBrackets': {
            '$push': '$winner'
          }
        }
      },
      {
        '$sort': {
          'nBrackets': -1
        }
      }
    ]).toArray(function (err, response) {
      res.send(response);
      client.close();
    });
  });
});

app.get('/authenticated', function (req, res) {
  sesh = req.session;
  if (sesh.access_token && sesh.refresh_token) {
    res.sendFile(__dirname + '/public/authenticated.html');
  }
  else
    res.redirect(401, '/');
});

app.get('/authenticated/tokens', function (req, res) {
  sesh = req.session;

  if (sesh.access_token && sesh.refresh_token) {
    var tokens = {
      access_token: sesh.access_token,
      refresh_token: sesh.refresh_token
    }
    res.send(tokens)
  }
  else
    res.redirect(401, '/');
});

app.post('/authenticated/create/', function (req, res) {
  sesh = req.session;
  if (sesh.access_token && sesh.refresh_token) {
    MongoClient.connect(mongodb_uri, { useNewUrlParser: true }, function (err, client) {
      if (err)
        throw err;
      
      var db = client.db(mongodb_db);

      var bracket = req.body;

      var today = new Date();
      var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
      var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
      var dateTime = date + ' ' + time;

      bracket.date = dateTime;
      db.collection("Brackets").insertOne(bracket, function (err, response) {
        if (err)
          throw err;
        console.log("1 bracket inserted");
        res.send(bracket._id);
        client.close();
      });
    });
  } else {
    res.status(401);
    res.send("You need to login!");
  }
});

app.get('/bracket/', function (req, res) {
  MongoClient.connect(mongodb_uri, { useNewUrlParser: true }, function (err, client) {
    if (err)
      throw err;

    var id = (ObjectId.isValid(req.query.id)) ? ObjectId(req.query.id) : null
    const cleanid = sanitize(id);

    var db = client.db(mongodb_db);
    var brackets = db.collection("Brackets");

    // Finding the desired bracket
    brackets.findOne({ _id: cleanid }, function (err, bracket) {
      if (bracket !== null) { // Found the bracket
        var response = {};

        response.bracket = bracket;

        artist = bracket.artist;

        brackets.aggregate([{
          '$match': {
            'artist': artist
          }
        }, {
          '$group': {
            '_id': '$winner',
            'occurences': {
              '$sum': 1
            }
          }
        }, {
          '$sort': {
            'occurences': -1
          }
        }, {
          '$limit': 1
        }
        ]).toArray(function (err, doc) {
          response.favourite = doc[0]._id;
          res.send(response);
          client.close();
        });
      }
      else { // Didn't find the bracket
        res.status(404);
        res.send('Bracket not found');
      }
    });
  });
});
app.listen(process.env.PORT || 80, () => {
  console.log("Now listening");
});