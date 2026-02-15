import { ThemeProvider } from '@/components/providers/theme-provider'
import { ThemeToggle } from '@/components/theme-toggle'
import { GithubButton } from '@/components/github-button'
import { QrGenerator } from '@/components/qr-generator'
import { QrCode } from 'lucide-react'
import { cn } from '@/lib/utils'

function App() {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
    >
      <div className="min-h-svh flex flex-col">
        <header className="py-2 px-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <a href="/" className="font-bold text-2xl flex gap-0.5 items-center" title="Go to homepage">
              QRcodeer
              <QrCode className="w-6 h-6" />
            </a>
            <div className="flex items-center gap-1">
              <ThemeToggle />
              <GithubButton />
            </div>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center p-4">
          <QrGenerator />
        </main>

        <div
          className={cn(
            'absolute inset-0 -z-10',
            'bg-size-[20px_20px]',
            'bg-[radial-gradient(#d4d4d4_1px,transparent_1px)]',
            'dark:bg-[radial-gradient(#404040_1px,transparent_1px)]'
          )}
        />
        <div className="pointer-events-none -z-10 absolute inset-0 flex items-center justify-center mask-[radial-gradient(ellipse_at_center,transparent_20%,black)] dark:bg-background" />
      </div>
    </ThemeProvider>
  )
}

export default App
