"use client"

interface ChatAreaProps {
  title?: string
  example?: string
}

export function ChatArea({
  title = "What do you want to know?",
  example = "What is the average temperature in Cambridge bay?",
}: ChatAreaProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8">
      <div className="max-w-2xl w-full text-center space-y-8">
        <h2 className="text-4xl font-semibold text-gray-800">{title}</h2>

        <div className="space-y-2">
          <p className="text-gray-600 font-medium">Example:</p>
          <p className="text-gray-800">{example}</p>
        </div>
      </div>
    </div>
  )
}
