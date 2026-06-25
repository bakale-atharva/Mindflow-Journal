import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { TopBar } from "@/components/layout/topbar";
import { Sidebar } from "@/components/layout/sidebar";
import { BottomNav } from "@/components/layout/bottom-nav";
import { ModalProvider } from "@/components/modal-provider";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-heading",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MindFlow Journal",
  description: "Your AI-powered mental wellness companion.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${spaceGrotesk.variable} h-full antialiased`}
    >
      <body className="flex h-full min-h-full flex-col md:flex-row overflow-hidden bg-secondary">
        <Sidebar />
        <div className="flex-1 flex flex-col h-full overflow-hidden relative">
          <TopBar />
          <main className="flex-1 overflow-y-auto relative pb-16 md:pb-0">
            {children}
          </main>
          <BottomNav />
        </div>
        <ModalProvider />
      </body>
    </html>
  );
}
