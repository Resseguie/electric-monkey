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

    isRunning = false,
    tailTimer,
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
    process.exit(-1);
  }

  if(!result || isNaN(result[0])) {
    console.log("Error getting animation duration: ", result);
    process.exit(-1);
  }

  ANIMATION_DURATION = Math.floor(result[0] * 1000);
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

  // Start it in center then start loop
  // that only runs if animation active
  tail.to(TAIL_CENTER, 1000);

});


function moveTail(pos) {
  // Calculate next position to go to recursively
  // and how long it should take us to get there
  // based on distance and shock state
  var newPos = Math.floor((Math.random() * TAIL_MAX) + TAIL_MIN),
      delta = Math.abs(pos - newPos),
      moveDelay = Math.floor( ((Math.random() * 1500) + 700) / TAIL_RANGE ),
      delay = Math.floor(((Math.random() * 300) + 100) );

  tail.to(pos, moveDelay);  

  tailTimer = setTimeout(function() {
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
    moveTail(TAIL_CENTER);

    itunes.play(TRACK_NAME, PLAYLIST_NAME); // play SFX

    // Stop animations after track finished
    setTimeout(function() {
      console.log("Shock Off");
      vibrate.low();
      strobe.low();
      clearTimeout(tailTimer);
      tail.to(TAIL_CENTER, 1000);
      isRunning = false;
    }, ANIMATION_DURATION + 1000);

  },1500);

  res.status(200).end();

}
