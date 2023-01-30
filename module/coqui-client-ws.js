const STT = require('stt');
const {EventEmitter} = require("events");

const fs = require('fs');
// const buffer = fs.readFileSync('./test.ogg');

class CoquiClient {
  constructor(modelPath, scorerPath) {
    this.model = new STT.Model(modelPath);
    if (scorerPath) {
      this.model.enableExternalScorer(scorerPath);
    }
  }

  getDesiredSampleRate = () => {
    return this.model.sampleRate();
  }

  streamingRecognize = (request) => {
    return new StreamingRecognizer(this.model.createStream());
  }
}

class StreamingRecognizer extends EventEmitter {
  constructor(stream) {
    super();

    this.stream = stream;

    // setTimeout(() => {
    //   this._recognize();
    // }, 500);
  }

  write = (buf) => {
    // console.log("new buf");
    this.stream.feedAudioContent(buf);
    const result = this.stream.intermediateDecode();
    this.emit('data', result);
  }

  end = () => {
    const finalResult = this.stream.finishStream();
    this.emit('data', finalResult);
    this.stream = null;
  }

  _recognize = () => {
    if (!this.stream) return;
    const result = this.stream.intermediateDecodeFlushBuffers();
    //console.log("new result", result);
    this.emit('data', result);
    setTimeout(() => this._recognize(), 100);
  }
}

module.exports = CoquiClient;