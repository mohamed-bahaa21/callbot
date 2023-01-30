let dotenv = require('dotenv')
dotenv.config()
const vosk = require('./callbot_vosk');
const engine = require('./engine');
const audio = require('./audio');
var notifier = require('./notifier')




//var audio_transcription;
var audio_transcription_o;
var audio_transcription_m;
var audio_transcription_mo;
var action_o;
var silence_ctr = undefined;
//var audio_is_playing;
var audio_is_playing_o;
var script_step = process.env.SCRIPT_STEP;
var processInterval;

//startInterval();
var trackerTimeout;
var audio_is_playing = false;
var caller;
var step_is_running = false;

notifier.on('audio-finished-playing', () => {
    console.log('audio finished playing');
    audio_is_playing = false;
    stepFunction();
});

notifier.on('audio-started-playing', () => {
    console.log('audio started playing');
    audio_is_playing = true;
});

notifier.on('back-one-step', () => {
    console.log('back one level');
    script_step -= 1;
    //stepFunction();
});

notifier.on('end-call', () => {
    console.log('end call');
    script_step -= 1;
});

notifier.on('transfer-call', () => {
    console.log('success, transfer call...');
    //script_step -=1;
});

stepFunction();

//function startInterval() {
//processInterval = 
//try {
function stepFunction() {
    //setTimeout(() => {
    //timestamp = Date.now();
    audio_is_playing = audio.audioIsPlaying();
    // if (audio_is_playing) return;
    //var play_audio_command = false;

    var action = engine.getAction();

    if (action != action_o) {
        if (action == 'back-one') {
            script_step -= 1;
            // console.log("step started");
        }
        // console.log(action);
        // console.log(action_o);
    }

    var audio_transcription = audio_is_playing == false ? vosk.audioTranscription() : undefined;

    if (audio_transcription == audio_transcription_o) {
        audio_transcription = undefined
    };

    //get audio transcription
    if (audio_transcription == undefined) silence_ctr++;

    if (audio_transcription) {
        console.log('call active, user says: ', audio_transcription);
        audio_transcription_m = audio_transcription;
        silence_ctr = 0;

    }
    else {

        if (silence_ctr >= 2 && audio_transcription_m) {
            //play audio file
            if (audio_is_playing != true) {
                //play_audio_command = true;
                // engine.evaluateResponse(script_step, audio_transcription_m);
                console.log(process.env.SCRIPT_STEP);
                engine.evaluateResponse(script_step, audio_transcription_m);
                audio_transcription_m = undefined;
                script_step++;
                setEnvKey("SCRIPT_STEP", script_step);
            }
        }
    }

    if (audio_is_playing != audio_is_playing_o) {
        if (audio_is_playing == false) {
            //script_step++;
        }
    }

    if (audio_transcription) audio_transcription_o = audio_transcription;
    if (audio_transcription_m) audio_transcription_mo = audio_transcription_m;

    audio_is_playing_o = audio_is_playing;


    //console.log('step .99');
    setTimeout(() => {
        stepFunction();
    }, 500);

}

const fs = require("fs");
const os = require("os");
// don't forget to install PM2 globally
function setEnvKey(key, value) {
    const ENV_VARS = fs.readFileSync("./.env", "utf8").split(os.EOL);
    
    const target = ENV_VARS.indexOf(ENV_VARS.find((line) => {
        return line.match(new RegExp(key));
    }));

    ENV_VARS.splice(target, 1, `${key}=${value}`);

    fs.writeFileSync("./.env", ENV_VARS.join(os.EOL));
}

process.on('unhandledRejection', (reason, promise) => {
    console.log(reason)
})
process.on('uncaughtException', (reason) => {
    console.log(reason)
})