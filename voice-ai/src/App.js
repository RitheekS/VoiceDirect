import { useState, useRef } from "react";
import { askGemini } from "./services/gemini";
import { speechToText, textToSpeech } from "./services/elevenlabs";

function App() {
  const [reply, setReply] = useState("");
  const [audioURL, setAudioURL] = useState("");
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  async function startRecording() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorderRef.current = new MediaRecorder(stream);

    mediaRecorderRef.current.ondataavailable = (e) => {
      chunksRef.current.push(e.data);
    };

    mediaRecorderRef.current.start();
    console.log("Recording started.");
  }

  async function stopRecording() {
    return new Promise((resolve) => {
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });
        chunksRef.current = [];
        resolve(audioBlob);
      };

      mediaRecorderRef.current.stop();
      console.log("Recording stopped.");
    });
  }

  async function handleProcess() {
    const audioBlob = await stopRecording();

    // STT
    const userText = await speechToText(audioBlob);

    // Gemini
    const aiReply = await askGemini(userText);
    setReply(aiReply);

    // TTS
    const audio = await textToSpeech(aiReply);
    const url = URL.createObjectURL(audio);
    setAudioURL(url);
  }

  return (
    <div style={{ padding: 40 }}>
      <h2>AI Voice Test</h2>

      <button onMouseDown={startRecording}>Hold to Record</button>

      <button onMouseUp={handleProcess}>Process</button>

      <p>{reply}</p>

      {audioURL && <audio controls autoPlay src={audioURL} />}
    </div>
  );
}

export default App;
