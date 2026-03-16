import { useEffect, useRef, useState } from "react";

function MicButton({ onResult }) {
  const recognitionRef = useRef(null);
  const restartTimeoutRef = useRef(null);
  const [isListening, setIsListening] = useState(false);
  const isListeningRef = useRef(false);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech Recognition not supported in this browser");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = false;

    recognition.onstart = () => {
      console.log("Mic started");
    };
  
    recognition.onresult = (event) => {
      const transcript =
        event.results[event.results.length - 1][0].transcript.trim().toLowerCase();

      console.log("Heard:", transcript);

      if (
        transcript === "turn off" ||
        transcript === "turn off the mic" ||
        transcript === "stop listening"
      ) {
        stopListening();
        return;
      }

      onResult(transcript);
    };

    recognition.onend = () => {
      console.log("Recognition ended");

      if (isListeningRef.current) {
        restartTimeoutRef.current = setTimeout(() => {
          try {
            recognition.start();
          } catch (err) {
            console.error("Restart error:", err);
          }
        }, 300);
      }
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
    };

    recognitionRef.current = recognition;

    return () => {
      if (restartTimeoutRef.current) clearTimeout(restartTimeoutRef.current);
      recognition.stop();
    };
  }, [onResult]);

  const startListening = () => {
    if (!recognitionRef.current) return;

    setIsListening(true);
    isListeningRef.current = true;

    try {
      recognitionRef.current.start();
    } catch (err) {
      console.error("Start error:", err);
    }
  };

  const stopListening = () => {
    if (!recognitionRef.current) return;

    setIsListening(false);
    isListeningRef.current = false;

    if (restartTimeoutRef.current) clearTimeout(restartTimeoutRef.current);

    recognitionRef.current.stop();
  };

  return (
    <button
      className="mic-circle"
      onClick={isListening ? stopListening : startListening}
    >
      {isListening ? "🛑" : "🎤"}
    </button>
  );
}

export default MicButton;