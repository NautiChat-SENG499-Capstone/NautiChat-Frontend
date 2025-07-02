// components/TTSButton.tsx

import React from "react";

interface TTSButtonProps {
  text: string;
}

const TTSButton: React.FC<TTSButtonProps> = ({ text }) => {
  const handleReadAloud = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <button
      onClick={handleReadAloud}
      className="text-sm px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-md shadow-sm"
      title="Read aloud"
    >
      🔊
    </button>
  );
};

export default TTSButton;
