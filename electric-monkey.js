#!/usr/bin/env node

var five = require("johnny-five"),
    board = new five.Board(),

    applescript = require("applescript"),
    iTunes = require("./iTunes.js"),
    itunes = new iTunes(),

    express = require("express"),
    app = express(),
    server,

    STROBE_PIN = 5,
    VIBRATE_PIN = 6,
    TAIL_PIN = 9,

    strobe,
    vibrate,
    tail,

    TAIL_CENTER = 45,
    TAIL_MIN = 10,
    TAIL_MAX = 80,
    TAIL_RANGE = TAIL_MAX - TAIL_MIN,
    TAIL_NORMAL_FACTOR = 0.08,
    TAIL_SHOCK_FACTOR = 0.5,
    tailFactor = TAIL_NORMAL_FACTOR,

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
  tail = new five.Servo(TAIL_PIN);

  // start normal tail movement
  moveTail(TAIL_CENTER);

});


function moveTail(pos) {
  // Calculate next position to go to recursively
  // and how long it should take us to get there
  // based on distance and shock state
  var newPos = Math.floor((Math.random() * TAIL_MAX) + TAIL_MIN),
      delta = Math.abs(pos - newPos),
      moveDelay = Math.floor( ((Math.random() * 1000) + 500) / (TAIL_RANGE * tailFactor) ),
      delay = Math.floor(((Math.random() * 800) + 400) * (1 - tailFactor) );

  tail.to(pos, moveDelay);

  setTimeout(function() {
    moveTail(newPos);
  }, delay + moveDelay);
}

// Initiates the animation sequence
function electrocuteMonkey() {
  if(isRunning) { return; }

  isRunning = true;

  vibrate.high(); // shake the cage
  strobe.high();  // strobe the lights
  tailFactor = TAIL_SHOCK_FACTOR; // move tail faster
  
  itunes.play(TRACK_NAME); // play SFX

  // Stop animations after track finished
  setTimeout(function() {
    vibrate.low();
    strobe.low();
    isRunning = false;
    tailFactor = TAIL_NORMAL_FACTOR;
  }, ANIMATION_DURATION + 1000);

}
