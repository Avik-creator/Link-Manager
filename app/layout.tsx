import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

const APP_NAME = "LinkDrop"
const APP_DESCRIPTION =
  "Save, organize, and sync links peer-to-peer. No server, no account needed. Works offline with CRDT-powered conflict-free sync across all your devices."

export const metadata: Metadata = {
  title: {
    default: `${APP_NAME} -- Local-First Link Manager`,
    template: `%s | ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,
  applicationName: APP_NAME,
  generator: "v0.app",
  keywords: [
    "link manager",
    "bookmark manager",
    "local-first",
    "peer-to-peer",
    "offline",
    "CRDT",
    "sync",
    "link organizer",
    "p2p",
    "no account",
  ],
  authors: [{ name: "LinkDrop" }],
  creator: "LinkDrop",
  metadataBase: new URL("https://link-manager-mu.vercel.app"),
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: APP_NAME,
    title: `${APP_NAME} -- Local-First Link Manager`,
    description: APP_DESCRIPTION,
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "LinkDrop -- Local-First Link Manager",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${APP_NAME} -- Local-First Link Manager`,
    description: APP_DESCRIPTION,
    images: ["/og-image.jpg"],
  },
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/icon-light-32x32.png", sizes: "32x32", type: "image/png", media: "(prefers-color-scheme: light)" },
      { url: "/icon-dark-32x32.png", sizes: "32x32", type: "image/png", media: "(prefers-color-scheme: dark)" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: { url: "/apple-icon.png", sizes: "180x180" },
  },
  manifest: "/manifest.json",
  robots: {
    index: true,
    follow: true,
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafafa" },
    { media: "(prefers-color-scheme: dark)", color: "#E63946" },
  ],
  width: "device-width",
  initialScale: 1,
  userScalable: true,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
