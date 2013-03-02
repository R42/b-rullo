
var http = require('http');

var fs = require('fs');
var path = require('path');
var controllerPath = 'controller.html';
var playerPath = 'player.html';

var players = [];

function requestListener(req, res){
  if (~req.url.indexOf('player'))
    fs.createReadStream(path.join(__dirname, playerPath)).pipe(res);
  else if (~req.url.indexOf('mp3'))
    fs.createReadStream(path.join(__dirname, req.url)).pipe(res);
  else
    fs.createReadStream(path.join(__dirname, controllerPath)).pipe(res);
}

function onListening() {
  console.log('Server started on port %d', port);
}

function onWsConnection(ws) {
  if (~ws.upgradeReq.url.indexOf('player')) {
    players.push(ws);
    ws.on('close', onPlayerClose.bind(ws));
  } else
    ws.on('message', onControllerMessage);
}

function onPlayerClose() {
  players.splice(players.indexOf(this), 1);
}

function onControllerMessage(message) {
  var i;
  for (i=0; i<players.length; ++i)
    players[i].send(message);
}

var server = http.createServer(requestListener);
var port = parseInt(process.env.PORT) || 8000;
server.listen(port, onListening);

var WebSocketServer = require('ws').Server
var wss = new WebSocketServer({ server: server });
wss.on('connection', onWsConnection);