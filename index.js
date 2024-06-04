var canvas = document.querySelector("#mic_canvas");
const video = document.querySelector("video");
var canvasCtx = canvas.getContext("2d");
var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
var source;
var stream;

var analyser = audioCtx.createAnalyser();
analyser.minDecibels = -90;
analyser.maxDecibels = -10;
analyser.smoothingTimeConstant = 0.85;

if (navigator.mediaDevices.getUserMedia) {
  console.log("getUserMedia supported.");
  var constraints = { video: true, audio: true };
  navigator.mediaDevices
    .getUserMedia(constraints)
    .then(function (stream) {
      window.stream = stream;
      video.srcObject = stream;
      source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      visualizeAudio();
    })
    .catch(function (err) {
      console.log("The following gUM error occured: " + err);
    });
} else {
  console.log("getUserMedia not supported on your browser!");
}

function visualizeAudio() {
  WIDTH = canvas.width;
  HEIGHT = canvas.height;

  analyser.fftSize = 256;
  var bufferLength = analyser.fftSize;
  console.log(bufferLength);
  var dataArray = new Uint8Array(bufferLength);

  canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);

  // draw an oscilloscope of the current audio source
  function draw() {
    drawVisual = requestAnimationFrame(draw);
    analyser.getByteTimeDomainData(dataArray);

    canvasCtx.fillStyle = "rgb(0, 0, 0)";
    canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

    canvasCtx.lineWidth = 2;
    canvasCtx.strokeStyle = "rgb(255, 255, 255)";

    const sliceWidth = (WIDTH * 1.0) / bufferLength;
    let x = 0;

    canvasCtx.beginPath();
    for (var i = 0; i < bufferLength; i++) {
      const v = dataArray[i] / 128.0;
      const y = (v * HEIGHT) / 2;

      if (i === 0) canvasCtx.moveTo(x, y);
      else canvasCtx.lineTo(x, y);

      x += sliceWidth;
    }

    canvasCtx.lineTo(WIDTH, HEIGHT / 2);
    canvasCtx.stroke();
  }
  draw();
}

var pan = audioCtx.createStereoPanner(audioCtx);

createOscillator();

panControl.addEventListener("input", function () {
  pan.pan.value = this.value;
});

panControl.addEventListener("mousedown", function () {
  createOscillator();
  oscillator.start();
});
panControl.addEventListener("mouseup", function () {
  oscillator.stop();
});

left_button.addEventListener("mousedown", function () {
  pan.pan.value = -1;
  panControl.value = -1;
  createOscillator();
  oscillator.start();
});

left_button.addEventListener("mouseup", function () {
  oscillator.stop();
});

right_button.addEventListener("mousedown", function () {
  pan.pan.value = 1;
  panControl.value = 1;
  createOscillator();
  oscillator.start();
});

right_button.addEventListener("mouseup", function () {
  oscillator.stop();
});

function createOscillator() {
  oscillator = audioCtx.createOscillator();
  oscillator.frequency.value = 1000;
  oscillator.connect(pan);
  pan.connect(audioCtx.destination);
}
