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

    TAIL_CENTER = 30, // set depending on "center" for your servo
                      // according to how it is mounted, may not
                      // necessarily be actual center (90) for servo
    TAIL_MIN = TAIL_CENTER - 30,
    TAIL_MAX = TAIL_CENTER + 30,
    TAIL_RANGE = TAIL_MAX - TAIL_MIN,
    TAIL_NORMAL_FACTOR = 0.08,
    TAIL_SHOCK_FACTOR = 0.5,
    tailFactor = TAIL_NORMAL_FACTOR,

    isRunning = false,
    TRACK_NAME = "electricmonkey",     // track name
    PLAYLIST_NAME = "Electric Monkey", // iTunes playlist it is in
    ANIMATION_DURATION = 15
;


// Make sure nothing playing already
itunes.stop();

// Get the duration of our electric shock SFX
itunes.duration(TRACK_NAME, PLAYLIST_NAME, function(err, result) {
  if(err) {
    console.log(err);
  }

  ANIMATION_DURATION = Math.floor(result * 1000);
  console.log("Animation Duration: "+ANIMATION_DURATION);
});


board.on("ready", function() {

  // Listen for triggers from Pebble
  app.get("/shock", electrocuteMonkey);

  server = app.listen(3000, function () {
    var host = server.address().address,
        port = server.address().port

    console.log("Electric Monkey listening at http://%s:%s", host, port);
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
      delay = Math.floor(((Math.random() * 600) + 200) * (1 - tailFactor) );

  tail.to(pos, moveDelay);

  setTimeout(function() {
    moveTail(newPos);
  }, delay + moveDelay);
}

// Initiates the animation sequence
function electrocuteMonkey(req, res) {
  if(isRunning) { return; }

  isRunning = true;
  
  console.log("Shock On");
  strobe.high();  // strobe the lights

  // my strobe takes 1.5 second to start flashing,
  // so adding artificial delay
  setTimeout(function() {
    vibrate.high(); // shake the cage

    tailFactor = TAIL_SHOCK_FACTOR; // move tail faster
    
    itunes.play(TRACK_NAME, PLAYLIST_NAME); // play SFX

    // Stop animations after track finished
    setTimeout(function() {
      console.log("Shock Off");
      vibrate.low();
      strobe.low();
      isRunning = false;
      tailFactor = TAIL_NORMAL_FACTOR;
    }, ANIMATION_DURATION + 1000);

  },1500);

  res.status(200).end();

}
