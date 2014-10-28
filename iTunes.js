var applescript = require("applescript");

function iTunes() {
  this.ITUNES_STOP = "tell app \"iTunes\" to stop";
  this.ITUNES_PLAY = "tell app \"iTunes\" to play track \"TRACK_NAME\" of playlist \"PLAYLIST_NAME\"";
  this.ITUNES_DURATION = "tell app \"iTunes\" to {duration} of track \"TRACK_NAME\" of playlist \"PLAYLIST_NAME\"";
}

iTunes.prototype.stop = function(script, callback) {
  applescript.execString(this.ITUNES_STOP, callback);
}

iTunes.prototype.play = function(track, playlist, callback) {
  track = track.replace(/[^a-z0-9-_ ]/gi,"");
  playlist = playlist.replace(/[^a-z0-9-_ ]/gi,"");

  var script =
    this.ITUNES_PLAY
      .replace("TRACK_NAME",track)
      .replace("PLAYLIST_NAME",playlist);
  applescript.execString(script, callback);
}

iTunes.prototype.duration = function(track, playlist, callback) {
  track = track.replace(/[^a-z0-9-_ ]/gi,"");
  playlist = playlist.replace(/[^a-z0-9-_ ]/gi,"");
  
  var script =
    this.ITUNES_DURATION
      .replace("TRACK_NAME",track)
      .replace("PLAYLIST_NAME",playlist);

  applescript.execString(script, callback);
}

module.exports = iTunes;