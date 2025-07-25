import React, { useState, useRef, useEffect } from "react";

interface OncApiQueryButtonProps {
  oncApiUrl?: string;
}

const OncApiQueryButton: React.FC<OncApiQueryButtonProps> = ({ oncApiUrl }) => {
  const [showPopup, setShowPopup] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        setShowPopup(false);
      }
    };

    if (showPopup) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showPopup]);

  const handleCopy = async () => {
    if (!oncApiUrl) return;
    try {
      await navigator.clipboard.writeText(oncApiUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error("Copy failed", err);
    }
  };

  if (!oncApiUrl) return null;

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setShowPopup(!showPopup)}
        className="text-sm px-3 py-1 bg-cyan-600 hover:bg-cyan-700 text-white rounded-md shadow-sm"
        title="View API Query"
      >
        API Query
      </button>

      {showPopup && (
        <div
          ref={popupRef}
          className="absolute z-10 top-0 left-full ml-2 w-80 p-3 bg-sky-100 text-sm text-gray-800 border border-cyan-300 rounded-lg shadow-lg"
        >
          <div className="break-words mb-2">{oncApiUrl}</div>
          <button
            onClick={handleCopy}
            className="text-xs px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-md"
          >
            {copied ? "Copied!" : "Copy URL"}
          </button>
        </div>
      )}
    </div>
  );
};

export default OncApiQueryButton;
