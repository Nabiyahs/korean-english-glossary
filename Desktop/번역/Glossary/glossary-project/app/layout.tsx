import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { getSession } from "./actions"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { signOut } from "./actions"
import { LogOut, User } from "lucide-react"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "한영 기술용어집",
  description: "SAMOO 하이테크 1본부 기술용어집",
    generator: 'v0.dev'
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const session = await getSession()

  // Add this console.log for debugging
  console.log("DEBUG: RootLayout - Session in layout:", session ? "PRESENT" : "ABSENT", "User ID:", session?.user?.id)

  return (
    <html lang="ko" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 items-center justify-between">
              <Link href="/" className="flex items-center gap-2 font-bold text-lg text-samoo-blue">
                한영 기술용어집
              </Link>
              <nav className="flex items-center gap-4">
                {session ? (
                  <>
                    <Link
                      href="/admin"
                      className="text-sm font-medium text-samoo-gray hover:text-samoo-blue transition-colors"
                    >
                      <Button variant="ghost" size="sm">
                        <User className="w-4 h-4 mr-2" />
                        관리자
                      </Button>
                    </Link>
                    <form action={signOut}>
                      <Button variant="ghost" size="sm">
                        <LogOut className="w-4 h-4 mr-2" />
                        로그아웃
                      </Button>
                    </form>
                  </>
                ) : (
                  <Link
                    href="/login"
                    className="text-sm font-medium text-samoo-gray hover:text-samoo-blue transition-colors"
                  >
                    <Button variant="ghost" size="sm">
                      로그인
                    </Button>
                  </Link>
                )}
              </nav>
            </div>
          </header>
          <main>{children}</main>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
