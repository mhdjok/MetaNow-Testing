// audio recorder
var voiceUrl;
var blob;
let recorder, audio_stream;
const recordButton = document.getElementById("recordButton");
const sendVoice = document.getElementById("sendVoice");

const stopButton = document.getElementById("stopButton");


const deleteRecord = document.getElementById("deleteRecord");


recordButton.addEventListener("click", function () {
    if($("#recordButton").hasClass("recording")) {
        stopRecording();
    }
    else {
        startRecording();
    }
});

async function isMicrophoneAllowed(){
    let isActive = false;
    await navigator.permissions.query({
        name: 'microphone'
    }).then(function(permissionStatus){
        if (permissionStatus.state == 'denied')
            return false;
        else {
            isActive = true
            return true;
        }

    });


    return isActive;
}

deleteRecord.addEventListener("click", function () {
    if (!$("#audio-playback").hasClass("hidden")) {
        $("#audio-playback").addClass("hidden")
    };

    if (!$("#deleteRecord").hasClass("hidden")) {
        $("#deleteRecord").addClass("hidden")
    };

    if (!$("#sendVoice").hasClass("hidden")) {
        $("#sendVoice").addClass("hidden")
    };

    if ($("#playback").hasClass("whiteBG")) {
        $("#playback").removeClass("whiteBG")
    };
});
stopButton.disabled = true;

// set preview
const preview = document.getElementById("audio-playback");

// set download button event
const downloadAudio = document.getElementById("downloadButton");
// downloadAudio.addEventListener("click", downloadRecording);

async function startRecording() {
    if (await isMicrophoneAllowed()) {
        $("#recordButton").addClass("button-animate");
        $("#recordButton").addClass("recording");


        if (!$("#audio-playback").hasClass("hidden")) {
            $("#audio-playback").addClass("hidden")
        }
        ;

        if (!$("#deleteRecord").hasClass("hidden")) {
            $("#deleteRecord").addClass("hidden")
        }
        ;

        if (!$("#sendVoice").hasClass("hidden")) {
            $("#sendVoice").addClass("hidden")
        }
        ;

        if ($("#playback").hasClass("whiteBG")) {
            $("#playback").removeClass("whiteBG")
        }
        ;

        if (!$("#downloadContainer").hasClass("hidden")) {
            $("#downloadContainer").addClass("hidden")
        }
        ;

        recordButton.addEventListener("click", stopRecording);

        navigator.mediaDevices.getUserMedia({audio: true})
            .then(function (stream) {
                let data = [];
                recorder = new MediaRecorder(stream);
                audio_stream = stream;

                recorder.addEventListener('start', e => {
                    data.length = 0;
                });

                recorder.addEventListener('dataavailable', event => {
                    data.push(event.data);
                });

                recorder.addEventListener('stop', () => {
                    blob = new Blob(data, {
                        'type': 'audio/mp3'
                    });
                    var url = URL.createObjectURL(blob);
                    console.log(blob);
                    preview.src = url;
                    voiceUrl = url;
                });
                recorder.start();
            });
    }
    else {
        alert('No Microphone permission')
    }
}

function stopRecording() {
    recorder.stop();
    audio_stream.getAudioTracks()[0].stop();
    // MediaRecorder.stop();

    $("#recordButton").removeClass("button-animate");
    $("#recordButton").removeClass("recording");

    $("#audio-playback").removeClass("hidden");
    $("#deleteRecord").removeClass("hidden");
    $("#sendVoice").removeClass("hidden");
    $("#downloadContainer").removeClass("hidden");
    $("#playback").addClass("whiteBG");

}



