
import * as React from "react"
import { Check } from "lucide-react"

// Simple utility function to combine class names
const cn = (...classes) => {
  return classes.filter(Boolean).join(" ")
}

const Checkbox = React.forwardRef(({ className, checked, onCheckedChange, ...props }, ref) => {
  const handleChange = (e) => {
    if (onCheckedChange) {
      onCheckedChange(e.target.checked)
    }
  }

  return (
    <div className="relative">
      <input
        type="checkbox"
        ref={ref}
        className={cn(
          "peer h-4 w-4 shrink-0 rounded-sm border border-gray-300 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 checked:bg-blue-600 checked:border-blue-600",
          className,
        )}
        checked={checked}
        onChange={handleChange}
        {...props}
      />
      {checked && <Check className="absolute top-0 left-0 h-4 w-4 text-white pointer-events-none" />}
    </div>
  )
})

Checkbox.displayName = "Checkbox"

export { Checkbox }
