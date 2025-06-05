import Image from "next/image";

export default function Header() {
  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white dark:bg-gray-900 shadow-md">
      <div className="flex items-center space-x-2">
        <Image src="/NautiChatLogo.png" alt="Logo" width={80} height={40} />
        <span className="text-lg font-semibold text-gray-800 dark:text-white">NautiChat</span>
      </div>
      
      <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
        Sign In
      </button>
    </header>
  );
}