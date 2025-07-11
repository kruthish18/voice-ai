import { useState, useRef } from "react";

function App() {
  const [transcript, setTranscript] = useState("");
  const [recording, setRecording] = useState(false);
  const [gptReply, setGptReply] = useState("");
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const streamRef = useRef(null);

  // Start recording audio
  const startRecording = async () => {
    setTranscript("");
    setGptReply("");
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    streamRef.current = stream;

    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;
    audioChunksRef.current = [];

    mediaRecorder.ondataavailable = (event) => {
      audioChunksRef.current.push(event.data);
    };

    mediaRecorder.onstop = async () => {
      const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
      if (blob.size === 0) {
        alert("Empty recording.");
        return;
      }

      const formData = new FormData();
      formData.append("audio", blob, "recording.webm");

      try {
        // Send audio to backend for transcription
        const res = await fetch("http://localhost:3001/transcribe", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        const transcriptText = data.text;
        setTranscript(transcriptText);

        // Send transcript to GPT for response
        const res2 = await fetch("http://localhost:3001/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: transcriptText }),
        });
        const gptData = await res2.json();
        setGptReply(gptData.reply);

        // Play GPT reply with speech synthesis
        const synth = window.speechSynthesis;
        const utter = new SpeechSynthesisUtterance(gptData.reply);
        utter.lang = "en-US";
        utter.rate = 1;
        synth.speak(utter);
      } catch (err) {
        console.error("Error:", err);
        alert("Something went wrong.");
      }
    };

    mediaRecorder.start();
    setRecording(true);
  };

  // Stop recording and cleanup
  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
  };

  // Replay GPT response
  const handleReplay = () => {
    if (gptReply) {
      const synth = window.speechSynthesis;
      const utter = new SpeechSynthesisUtterance(gptReply);
      utter.lang = "en-US";
      utter.rate = 1;
      synth.speak(utter);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center p-8 font-sans">
      <h1 className="text-4xl font-bold text-gray-800 mb-1 text-center">
        Venting Listener
      </h1>
      <p className="text-gray-600 text-center mb-6">
        Speak freely. This assistant listens without judgment.
      </p>

      {/* Record/Stop buttons */}
      <div className="flex gap-4 mb-10">
        <button
          onClick={startRecording}
          disabled={recording}
          className="bg-purple-600 text-white px-5 py-2 rounded-full shadow hover:bg-purple-700"
        >
          🎤 Vent
        </button>
        <button
          onClick={stopRecording}
          disabled={!recording}
          className="bg-green-500 text-white px-5 py-2 rounded-full shadow hover:bg-green-600"
        >
          ✅ Done
        </button>
      </div>

      {/* Chat-style layout */}
      <div className="flex flex-col items-center gap-6 w-full max-w-3xl">
        <div className="flex flex-col gap-4 w-full">
          {/* User message bubble */}
          <div className="flex justify-start">
            <div className="bg-white rounded-2xl px-6 py-4 shadow-md min-h-[100px] max-w-[70%] w-fit">
              <h2 className="text-md font-semibold text-gray-800 mb-1">
                What you said
              </h2>
              <p className="text-gray-700">
                {transcript || "Your transcript will appear here..."}
              </p>
            </div>
          </div>

          {/* GPT message bubble */}
          <div className="flex justify-end">
            <div className="bg-orange-100 rounded-2xl px-6 py-4 shadow-md min-h-[100px] max-w-[70%] w-fit">
              <h2 className="text-md font-semibold text-gray-800 mb-1">
                Supportive Response
              </h2>
              <p className="text-gray-700">
                {gptReply || "GPT response will appear here..."}
              </p>

              {gptReply && (
                <button
                  onClick={handleReplay}
                  className="mt-3 text-sm text-blue-600 hover:underline focus:outline-none"
                >
                  Replay response
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
