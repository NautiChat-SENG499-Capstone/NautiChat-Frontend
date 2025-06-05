// components/ThemeToggle.tsx
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  return (
    <button
      onClick={() => setDark(!dark)}
      className="text-sm text-gray-700 dark:text-gray-200"
    >
      {dark ? "Light Mode" : "Dark Mode"}
    </button>
  );
}
