var applescript = require("applescript");

function iTunes() {
  this.ITUNES_STOP = "tell app \"iTunes\" to stop";
  this.ITUNES_PLAY = "tell app \"iTunes\" to play track \"TRACK_NAME\" of playlist \"Electric Monkey\"";
  this.ITUNES_DURATION = "tell app \"iTunes\" to {duration} of track \"TRACK_NAME\" of playlist \"Electric Monkey\"";
}

iTunes.prototype.stop = function(script, callback) {
  applescript.execString(this.ITUNES_STOP, callback);
}

iTunes.prototype.play = function(track, callback) {
  track = track.replace(/[^a-z0-9-_ ]/gi,"");
  applescript.execString(this.ITUNES_PLAY.replace("TRACK_NAME",track), callback);
}

iTunes.prototype.duration = function(track, callback) {
  track = track.replace(/[^a-z0-9-_ ]/gi,"");
  applescript.execString(this.ITUNES_DURATION.replace("TRACK_NAME",track), callback);
}

module.exports = iTunes;