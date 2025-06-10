import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Eye, EyeOff } from "lucide-react"
import { useState } from "react"

export default function PasswordInput({
  id,
  name,
  placeholder,
  value,
  onChange,
  disabled,
}: {
  id: string
  name: string
  placeholder: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  disabled: boolean
}) {
  const [show, setShow] = useState(false)

  return (
    <div className="relative">
      <Input
        id={id}
        name={name}
        type={show ? "text" : "password"}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required
        disabled={disabled}
        className="h-12 pr-10"
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
        onClick={() => setShow(!show)}
        disabled={disabled}
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        <span className="sr-only">{show ? "Hide" : "Show"} password</span>
      </Button>
    </div>
  )
}
