import { ReactNode, useContext, useLayoutEffect } from "react"
import clsx from "clsx"
import Layout from "../../contexts/Layout"

// Header component props type
type HeaderProps = {
  logo: ReactNode
  className?: string
  children: ReactNode
}

// Presentational component: renders the header visually
function HeaderComponent({ logo, className = "", children }: HeaderProps) {
  const baseClasses =
    "flex justify-between items-center py-3 px-4 bg-black text-white"

  return (
    <header className={clsx(baseClasses, className)}>
      <div className="flex align-middle items-center gap-5">{logo}</div>
      <div>{children}</div>
    </header>
  )
}

// Main component: handles local rendering or Layout Context rendering
export default function Header({ logo, className, children }: HeaderProps) {
  const { setBaseHeader } = useContext(Layout)
  const hasLayoutContext = Boolean(setBaseHeader)

  // If Layout Context exists, "teleport" the header into the global layout
  useLayoutEffect(() => {
    if (!setBaseHeader) return

    // Mount the header in the layout
    setBaseHeader(
      <HeaderComponent logo={logo} className={className}>
        {children}
      </HeaderComponent>
    )

    // Cleanup on unmount
    return () => {
      setBaseHeader(null)
    }
  }, [logo, className, children, setBaseHeader])

  // Layout mode: render nothing here (header is managed elsewhere)
  if (hasLayoutContext) {
    return null
  }

  // Local mode: render the header directly
  return (
    <HeaderComponent logo={logo} className={className}>
      {children}
    </HeaderComponent>
  )
}
