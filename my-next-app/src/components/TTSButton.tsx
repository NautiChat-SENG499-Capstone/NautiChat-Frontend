import React, { useState, useEffect } from "react";

interface TTSButtonProps {
  text: string;
}

const TTSButton: React.FC<TTSButtonProps> = ({ text }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showUnsupportedMessage, setShowUnsupportedMessage] = useState(false);

  const handleToggleSpeech = () => {
    // Check if we're in the browser and if TTS is supported
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setShowUnsupportedMessage(true);
      setTimeout(() => setShowUnsupportedMessage(false), 2500); // Hide after 2.5s
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";

      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  useEffect(() => {
    return () => {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  return (
    <div className="relative inline-block">
      <button
        onClick={handleToggleSpeech}
        className={`text-sm px-2 py-1 rounded-md shadow-sm transition-colors duration-200 ${
          isSpeaking ? "bg-red-500 hover:bg-red-600" : "bg-blue-500 hover:bg-blue-600"
        } text-white`}
        title={isSpeaking ? "Stop reading" : "Read aloud"}
      >
        {isSpeaking ? "❌" : "🔊"}
      </button>

      {showUnsupportedMessage && (
        <div className="absolute top-full mt-1 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded-md shadow z-10">
          Your browser does not support Text To Speech
        </div>
      )}
    </div>
  );
};

export default TTSButton;
