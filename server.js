// server.js
// where your node app starts

// init project
const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
var request = require('request');
var rp = require('request-promise-native');
var bunyan = require('bunyan');
var ringbuffer = new bunyan.RingBuffer({ limit: 5 });
var log = bunyan.createLogger({
    name: 'logs',
    streams: [
        {
            level: 'info',
            stream: process.stdout
        },
        {
            level: 'trace',
            type: 'raw',    // use 'raw' to get raw log record objects
            stream: ringbuffer
        }
    ]
});

const app = express();

// we've started you off with Express, 
// but feel free to use whatever libs or frameworks you'd like through `package.json`.

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));
app.use(bodyParser.json()); // for parsing application/json

// http://expressjs.com/en/starter/basic-routing.html
app.get('/', function(request, response) {
  response.sendFile(__dirname + '/views/index.html');
});

// listen for requests :)
const listener = app.listen(process.env.PORT, function() {
  console.log('Your app is listening on port ' + listener.address().port);
});

app.post('/create_account', function(req, res) {
  var client_details = req.body;
  var tosend = {
      email:client_details.email,
      first_name:client_details.first_name,
      last_name:client_details.last_name,
      company:client_details.company,
      partner_id:process.env.oauth_client_id,
      partner_secret:process.env.oauth_client_secret
    };
  log.info("Request to https://api.stitchdata.com/v3/accounts")
  request({
    url:'https://api.stitchdata.com/v3/accounts',
    method:'POST',
    json: true,
    body: tosend,
  }, function (error, response, body){
    log.info('Client ID ' + body.stitch_account_id + ' added successfully');
    res.send(body);
  });
})

app.get('/getLogs', function(request, response) {
  response.send(ringbuffer.records)
})

app.post('/login', function(req,res){
  var bearer = req.body.bearer;
  log.info('Creating Session; CID:' + req.body.client_id)
  request({
    url:'https://api.stitchdata.com/v3/sessions/ephemeral',
    method:'POST',
    auth: {'bearer': bearer}
  }, function (error, response, body){
    console.log(body)
    log.info('Session Created for Client ID ' + req.body.client_id);
    res.send(body);
  });
})