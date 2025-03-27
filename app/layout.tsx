import './globals.css'
import { Inter } from 'next/font/google'
import { ThemeProvider } from '@/components/ThemeProvider'
import { ThemeToggle } from '@/components/ThemeToggle'
import Link from 'next/link'
import { NavigationMenuLink, NavigationMenu, NavigationMenuList } from '@/components/ui/navigation-menu'
import { Toaster } from "sonner"

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Admin Dashboard',
  description: 'Organization and User Management System',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen bg-background text-foreground`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Toaster position="top-right" expand />
          <div className="min-h-screen flex flex-col">
            <nav className="bg-card text-card-foreground shadow-sm">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-[8vh]">
                  <div className="flex justify-between">
                    <div className="flex-shrink-0 flex items-center">
                      <span className="text-2xl font-bold">Generador de artículos</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex ml-8">
                      <NavigationMenu>
                        <NavigationMenuList className="gap-4">
                          <Link href="/record" legacyBehavior passHref>
                            <NavigationMenuLink className="text-sm font-medium">
                              Historial de artículos
                            </NavigationMenuLink>
                          </Link>
                        </NavigationMenuList>
                      </NavigationMenu>
                    </div>
                    <ThemeToggle />
                  </div>
                </div>
              </div>
            </nav>
            <main className="flex-grow flex flex-col min-h-0 p-6">
              {children}
            </main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}