import * as React from "react"

// Simple utility function to combine class names
const cn = (...classes) => {
  return classes.filter(Boolean).join(" ")
}

const buttonVariants = {
  variant: {
    default: "bg-blue-600 text-white hover:bg-blue-700",
    destructive: "bg-red-600 text-white hover:bg-red-700",
    outline: "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50",
    secondary: "bg-gray-200 text-gray-900 hover:bg-gray-300",
    ghost: "text-gray-700 hover:bg-gray-100",
    link: "text-blue-600 underline-offset-4 hover:underline",
  },
  size: {
    default: "h-10 px-4 py-2",
    sm: "h-9 px-3 text-sm",
    lg: "h-11 px-8",
    icon: "h-10 w-10",
  },
}

const Button = React.forwardRef(
  ({ className, variant = "default", size = "default", asChild = false, ...props }, ref) => {
    const baseClasses =
      "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"

    const variantClasses = buttonVariants.variant[variant] || buttonVariants.variant.default
    const sizeClasses = buttonVariants.size[size] || buttonVariants.size.default

    const combinedClassName = cn(baseClasses, variantClasses, sizeClasses, className)

    if (asChild) {
      return React.cloneElement(props.children, {
        ...props,
        ref,
        className: combinedClassName,
      })
    }

    return <button className={combinedClassName} ref={ref} {...props} />
  },
)

Button.displayName = "Button"

export { Button, buttonVariants }
