const fs = require('fs');
const recorder = require('node-record-lpcm16');
var vosk = require('./module/vosk');
const audio = require('./audio');

vosk.setLogLevel(0);

MODEL_PATH = "model"
const model = new vosk.Model(MODEL_PATH);
const sampleRateHertz = 44100;
const recording = recorder.record({
    // Other options, see https://www.npmjs.com/package/node-record-lpcm16#options
    channels: 1,
    sampleRate: sampleRateHertz,
    endOnSilence: false,
    keepSilence: true,
    recorder: 'sox', // Try also "arecord" or "sox"
});

var audio_transcription;



class VAD {
    constructor() {
        this.id = "VADClass";
        this._speechTime = 0;
        this._silenceTime = 0;
        this._isSpeech = false;
        this._speechFrames = []
    }

    get speechTime() {
        return this._speechTime;
    }

    set speechTime(speechTime) {
        this._speechTime = speechTime;
    }

    get silenceTime() {
        return this._silenceTime;
    }

    set silenceTime(silenceTime) {
        this._silenceTime = silenceTime;
    }

    get isSpeech() {
        return this._isSpeech;
    }

    set isSpeech(isSpeech) {
        this._isSpeech = isSpeech;
    }

    clearSpeechFrames() {
        this._speechFrames = [];
    }

    writeWav() {
        if (this._speechFrames.length > 0) {
            const filename = `test_${new Date().getTime()}.wav`;
            const file = new FileWriter(filename, { sampleRate: sampleRateHertz, channels: 1 });

            var frames = this._speechFrames;
            var that = this;
            for (let i = 0; i < frames.length; i++) {
                file.write(frames[i], function () {
                    if (i === frames.length - 1) {
                        file.end();
                        console.log(filename, ' - completed')
                        //that.getSTTResult(filename);
                    }
                });
            }
        }
    }


    updateChunkData(frameData) {
        // arrayBuffer =  [ 4, 4, 5, 6, 6, 7, 8, 9 ];
        var arryBufferInt16 = new Int16Array(frameData.buffer);
        var arrayMean = arryBufferInt16.reduce((a, b) => a + b * b / arryBufferInt16.length, 0);
        arrayMean = Math.sqrt(arrayMean);
        arrayMean /= 32767;
        var speechTr = 0.005;

        // frame buffer time
        var frameTime = arryBufferInt16.length / sampleRateHertz;

        // check if current frame is speech
        if (arrayMean > speechTr) {
            this.speechTime = this.speechTime + frameTime;

            if (this.speechTime > 0.1) {
                // update speech
                this.isSpeech = true;

                // reset silence time
                this.silenceTime = 0
            }

            // push speech frames
            this._speechFrames.push(frameData);
        }
        else {
            this.silenceTime = this.silenceTime + frameTime;

            // silence case
            if (this.isSpeech && this.silenceTime >= 0.5) {
                // set no speech
                this.speechTime = 0;
                this.isSpeech = false;
                //console.log(arrayMean);
                this.clearSpeechFrames();
            }
        }
    }

    updateInformation(arrayBuffer) {
        // calculate chunk data
        var chunkSize = 1600; // 50ms
        var chunkNum = Math.floor(arrayBuffer.byteLength / chunkSize);

        // update chunk vad information
        for (let i = 0; i < chunkNum - 1; i++) {
            var stIdx = i * chunkSize;
            var endIdx = (i + 1) * chunkSize;
            this.updateChunkData(arrayBuffer.slice(stIdx, endIdx));
        }

        // update final chunk data in this frame
        this.updateChunkData(arrayBuffer.slice((chunkNum - 1) * chunkSize, arrayBuffer.byteLength));
    }

    sayStatus() {
        if (this.isSpeech) {
            console.log("speaking");
        }
        else {
            console.log("silent");
        }
    }
}

vad = new VAD()

class RestartableRecogniser {
    constructor({ model, textCallback }) {
        this.model = model;
        this.textCallback = textCallback;
        this.recStream = null;
        this.started = false;
    }

    start() {
        if (this.started) {
            return;
        }
        this.recStream = new vosk.Recognizer({ model: model, sampleRate: sampleRateHertz });
        this.started = true;
    }

    stop() {
        if (!this.started) {
            return;
        }
        this._clearRecStream();
        this.started = false;
    }

    restart() {
        this.stop();
        this.start();
    }

    write(buf) {
        if (!this.started) {
            return;
        }
        if (this.recStream.acceptWaveform(buf))
            this.textCallback(this.recStream.result().text);
        else
            this.textCallback(this.recStream.partialResult().partial);
    }

    _clearRecStream() {
        if (!this.recStream) {
            return;
        }

        let result = this.recStream.finalResult();
        this.textCallback(result.text)
        this.recStream.free();
        this.recStream = null;
    }
}

var recognizer = new RestartableRecogniser({
    model: model,
    textCallback: (data) => {
        if (data) {
            //console.log(data);
            //var audio_is_playing = audio.audioIsPlaying();
            //console.log('@vosk audio is playing', audio_is_playing);
            //if (audio_is_playing == false) 
            audio_transcription = data;
            //else audio_transcription = undefined;
        }
    },
});

//
function completedFn(data, completed) {

    recognizer.write(data);
    var statusBefore = vad.isSpeech;
    vad.updateInformation(data);
    var statusNow = vad.isSpeech;
    if (statusBefore && !statusNow) {
        recognizer.restart();
    }

    const remaining_task = que.length();
    completed(null, { data, remaining_task });
}

const async = require('async');
const que = async.queue(completedFn, 1);

function recognizeFromMicrophone() {

    recognizer.start();

    recording
        .stream()
        .on('data', function (data) {
            que.push(data, (err, { data, remaining }) => {
                if (err) {
                    console.log(`there is an error  in the task ${data}`);
                } else {
                    //console.log(`queue has execute the task ${data}
                    //        . ${remaining} tasks remaining`);
                    //rm 
                    // cbFn();
                }
            }
            );
        })
        .on('end', function () {
            console.log('recording ended')
            recognizer.stop();
        });
    //.pipe();
}

recognizeFromMicrophone();
var audio_is_playing_o;
var audio_is_playing;

setInterval(() => {
    //console.log('vosk interval');
    if (recognizer) {
        audio_is_playing = audio.audioIsPlaying();
        if (audio_is_playing != audio_is_playing_o) {
            if (audio_is_playing == false) {
                recognizer.start();
                //console.log('start recognizer');
            }
            else {
                recognizer.stop();
                //console.log('stop recognizer');
            }
        }
    }
}, 500);

function audioTranscription() {
    return audio_transcription;
}

module.exports = {
    audioTranscription: audioTranscription
}