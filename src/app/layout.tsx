import './globals.css'
export const metadata = { title: 'PrepBrain AI', description: 'Your Intelligence. Your Learning. Your Growth.' }
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>
}
