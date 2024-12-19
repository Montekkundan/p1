import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function WebsiteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-black">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/50 backdrop-blur-sm border-b border-neutral-800">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link 
            href="/" 
            className="text-2xl font-bold text-white hover:text-neutral-300 transition"
          >
            P1
          </Link>
          
          <Link href="/dashboard">
            <Button variant="outline" className="text-white hover:text-neutral-300">
              Dashboard
            </Button>
          </Link>
        </div>
      </nav>
      
      <main className="pt-16">
        {children}
      </main>
    </div>
  )
} 