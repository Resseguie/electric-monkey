#!/usr/bin/env node

var five = require("johnny-five"),
    board = new five.Board(),

    applescript = require("applescript"),
    iTunes = require("./iTunes.js"),
    itunes = new iTunes(),

    express = require("express"),
    app = express(),
    server,
    
    //say = require("say");

    STROBE_PIN = 9,
    VIBRATE_PIN = 6,

    strobe,
    vibrate,

    isRunning = false,
    TRACK_NAME = "electric shock sound",
    ANIMATION_DURATION = 15
;


// Make sure nothing playing already
itunes.stop();

// Get the duration of our electric shock SFX
itunes.duration(TRACK_NAME, function(err, result) {
  ANIMATION_DURATION = Math.floor(result * 1000);
});


board.on("ready", function() {

  // Listen for triggers from Pebble
  app.get('/shock', electrocuteMonkey);

  server = app.listen(3000, function () {
    var host = server.address().address,
        port = server.address().port

    console.log('Electric Monkey listening at http://%s:%s', host, port);
  });

  strobe = new five.Pin(STROBE_PIN);
  vibrate = new five.Pin(VIBRATE_PIN);


});


function electrocuteMonkey() {
  if(isRunning) { return; }

  isRunning = true;

  vibrate.high();
  strobe.high();
  
  itunes.play(TRACK_NAME);

  setTimeout(function() {
    vibrate.low();
    strobe.low();
    isRunning = false;
  }, ANIMATION_DURATION + 1000);

}
