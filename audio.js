
//var player = require('play-sound')(opts = {});
//var play = require('play').Play();

//play audio file

/*
player.play('./intro.wav', function(err) {
    if (err) throw err;
    //console.log(stdout)                                                                                               
    //console.log(stderr)
 });
*/


// require and stuff happened here
//var play = require('play');
//var player = false;

// Force it to use mplayer (can be anything else)
/*
play.usePlayer('mplayer');
play.on('play', function () {
  player = play.player;
});

play.sound('./intro.wav');
*/


const Speaker = require('speaker');
var fs = require('fs');
var notifier = require('./notifier');


var audio_is_playing = false;
var audioStream;
var speaker;
var audio_duration;

// Create the Speaker instance


//playFile();

function playFiles(audios, idx) {



  //return new Promise(function (resolve, reject) {

  console.log('playing ', audios[idx]);

  speaker = new Speaker({
    channels: 2,          // 2 channels
    bitDepth: 16,         // 16-bit samples
    sampleRate: 22031.25, // 22031.25 Hz sample rate
    device: 'hw:2,0'
    //device: 'hw:5,0'
  });

  //var audio_filename;
  //if (script_test == 1) audio_filename = './intro.wav';


  audioStream = fs.createReadStream(audios[idx]);


  // PCM data from stdin gets piped into the speaker
  //process.stdin.pipe(speaker);
  audio_is_playing = true;
  notifier.emit('audio-started-playing');
  audioStream.pipe(speaker);


  if (audios[idx] == './sounds/Intro.wav') audio_duration = 5000;
  else if (audios[idx] == './sounds/Im fine.wav') audio_duration = 1500;
  else if (audios[idx] == './sounds/Notinterested_1.wav') audio_duration = 2000;
  else if (audios[idx] == './sounds/Notinterested_2.wav') audio_duration = 9000;
  else if (audios[idx] == './sounds/opt.wav') audio_duration = 2000;
  else if (audios[idx] == './sounds/PartA&B.wav') audio_duration = 4000;
  else if (audios[idx] == './sounds/pitch_1.wav') audio_duration = 3000;
  else if (audios[idx] == './sounds/pitch_2.wav') audio_duration = 7200;
  else if (audios[idx] == './sounds/Sorry to hear that.wav') audio_duration = 500;
  else if (audios[idx] == './sounds/Transferconsent.wav') audio_duration = 9000;
  else if (audios[idx] == './sounds/Goodtohear.wav') audio_duration = 1500;
  else if (audios[idx] == './sounds/age.wav') audio_duration = 2000;
  else if (audios[idx] == './sounds/saythatagain.wav') audio_duration = 1500;

  console.log('audio_duration', audio_duration);
  if (audio_duration) {
    setTimeout(() => {
      //console.log('audio finished playing...');
      //speaker.end();
      idx += 1;
      if (audios[idx]) {
        console.log('play next...');
        //audioStream.destroy();
        //setTimeout(() => {

        //speaker.destroy();  
        return playFiles(audios, idx);
        //},100);

      }
      else {
        //audioStream.destroy();
        audio_is_playing = false;
        notifier.emit('audio-finished-playing');
      }
    }, audio_duration + 500);

  }

  /*
  audioStream.on('close', function () {
    console.log('finished playing', audios[idx]);
    speaker.end();
    idx += 1;
    if (audios[idx]) {
      console.log('play next...');
      audioStream.destroy();
      //setTimeout(() => {

      //speaker.destroy();  
      playFiles(audios, idx);
      //},100);

    }
    else {
      audioStream.destroy();
      audio_is_playing = false;
    }

  });
  */
  //})
}

/*
function playAudioPromise(audios, idx){
  return new Promise(function (resolve, reject) {

    speaker = new Speaker({
      channels: 2,          // 2 channels
      bitDepth: 16,         // 16-bit samples
      sampleRate: 22031.25, // 22031.25 Hz sample rate
      device: 'hw:2,0'
      //device: 'hw:5,0'
    });

    //var audio_filename;
    //if (script_test == 1) audio_filename = './intro.wav';


    audioStream = fs.createReadStream(audios[idx]);


    // PCM data from stdin gets piped into the speaker
    //process.stdin.pipe(speaker);
    audio_is_playing = true;
    audioStream.pipe(speaker);
  });
}
*/
/*
function playSingleFile(audio_filename){
  playFile(audio_filename, true);
}
*/

//function playSequence(audios){
//console.log('audio.playSequence()', audios);

//var audio_filename;
//if (script_test == 1) audio_filename = './intro.wav';
//var idx = 0;
//playFile(audios[idx], idx == (audios.length-1));
/*
var audioStream = fs.createReadStream(audios[0]);

// PCM data from stdin gets piped into the speaker
//process.stdin.pipe(speaker);
audio_is_playing = true;
audioStream.pipe(speaker);
audioStream.on('close',function(){
  audio_is_playing = false;
  console.log('audio finished palying');
});
*/
//}

function audioIsPlaying() {
  return audio_is_playing;
}



module.exports = {
  playFiles: playFiles,
  audioIsPlaying: audioIsPlaying,
  //playAudioPromise: playAudioPromise
}



/*
var http = require('http');
var fs = require('fs');

http.createServer(function(req, res) {
  // This opens up the writeable stream to `output`
  var writeStream = fs.createWriteStream('./output');

  // This pipes the POST data to the file
  req.pipe(writeStream);

  // After all the data is saved, respond with a simple html form so they can post more data
  req.on('end', function () {
    res.writeHead(200, {"content-type":"text/html"});
    res.end('<form method="POST"><input name="test" /><input type="submit"></form>');
  });

  // This is here incase any errors occur
  writeStream.on('error', function (err) {
    console.log(err);
  });
}).listen(8080);
*/