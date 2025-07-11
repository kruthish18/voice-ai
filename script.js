console.log("Script loaded");

let mediaRecorder;
let audioChunks = [];
let micStream = null; // Store mic stream globally

const recordBtn = document.getElementById("recordBtn");
const stopBtn = document.getElementById("stopBtn");
const audioPlayback = document.getElementById("audioPlayback");

recordBtn.addEventListener("click", async () => {
  try {
    console.log("Requesting mic access...");
    micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    audioChunks = [];
    mediaRecorder = new MediaRecorder(micStream);

    mediaRecorder.ondataavailable = event => {
      console.log("Data received:", event.data.size, "bytes");
      audioChunks.push(event.data);
    };

    mediaRecorder.onstop = async () => {
      console.log("Recording stopped");

      if (audioChunks.length === 0) {
        console.error("No audio data captured.");
        return;
      }

      const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
      console.log("Blob created:", audioBlob.size, "bytes");

      if (audioBlob.size === 0) {
        console.error("Blob is empty. Aborting.");
        return;
      }

      const audioUrl = URL.createObjectURL(audioBlob);
      audioPlayback.src = audioUrl;

      await handleAudioBlob(audioBlob);
    };

    mediaRecorder.start();
    console.log("Recording started");
    recordBtn.disabled = true;
    stopBtn.disabled = false;

  } catch (err) {
    console.error("Mic access error:", err);
  }
});

stopBtn.addEventListener("click", () => {
  if (mediaRecorder && mediaRecorder.state === "recording") {
    console.log("Stop clicked, stopping recorder...");
    mediaRecorder.stop();

    if (micStream) {
      micStream.getTracks().forEach(track => {
        console.log("Stopping track:", track.kind);
        track.stop();
      });
    }

    recordBtn.disabled = false;
    stopBtn.disabled = true;
  }
});

async function handleAudioBlob(blob) {
  console.log("handleAudioBlob called");

  if (!blob || blob.size === 0) {
    console.error("Empty blob");
    return;
  }

  const formData = new FormData();
  formData.append('audio', blob, 'recording.webm');
  console.log("FormData ready");

  const transcriptOutput = document.getElementById("transcriptOutput");
  if (!transcriptOutput) {
    console.error("transcriptOutput element not found");
    return;
  }

  transcriptOutput.innerText = 'Transcribing...';

  try {
    const response = await fetch('http://localhost:3001/transcribe', {
      method: 'POST',
      body: formData
    });

    const rawText = await response.text();
    const data = JSON.parse(rawText);

    transcriptOutput.innerText = `You said: "${data.text}"`;
    alert("Transcript: " + data.text);

  } catch (err) {
    console.error("Fetch error:", err);
    alert("Error during transcription: " + err.message);
    transcriptOutput.innerText = 'Error during transcription';
  }
}

console.log("Script setup complete");
