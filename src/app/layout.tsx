import type { Metadata } from "next";
import { Inter, Inter_Tight, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const interTight = Inter_Tight({
  variable: "--font-inter-tight",
  subsets: ["latin"],
  display: "swap",
});

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Zoho Books Finance Workspace",
    template: "%s | Zoho Books",
  },
  description:
    "A real-time finance dashboard powered by Zoho Books. Analyse P&L reports, track invoices & bills, and manage vendor relationships.",
  keywords: ["Zoho Books", "P&L", "invoices", "bills", "vendors", "finance", "accounting"],
  authors: [{ name: "DGP" }],
  robots: "noindex, nofollow", // internal tool — keep out of search engines
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${interTight.variable} ${jetBrainsMono.variable} h-full antialiased`}
    >
      <body className="h-screen flex overflow-hidden">
        <main className="flex h-full w-full bg-[#f6f7f2] font-[family-name:var(--font-inter)] text-[#1e293b]">
          {/* Sidebar — strict fixed width, full height, no shrink */}
          <aside className="flex flex-col justify-between flex-shrink-0 w-[240px] h-full p-[28px_22px] text-slate-50 bg-[#173f35] gap-[22px] overflow-y-auto">
            <div>
              <div className="grid w-11 h-11 mb-[22px] place-items-center rounded-lg text-[#173f35] bg-[#d8f275] font-extrabold">
                ZB
              </div>
              <h1 className="m-0 text-2xl">Profit & Loss</h1>
              <p className="m-[8px_0_0] text-[#b9cbc5]">
                Zoho Books report workspace
              </p>
            </div>
            <nav className="grid gap-2">
              <a
                href="/reports"
                className="p-[11px_12px] rounded-lg text-[#dbe7e3] cursor-pointer hover:bg-[#113028]"
              >
                Report
              </a>
              <a
                href="/invoices"
                className="p-[11px_12px] rounded-lg text-[#dbe7e3] cursor-pointer hover:bg-[#113028]"
              >
                Invoices
              </a>
              <a
                href="/bills"
                className="p-[11px_12px] rounded-lg text-[#dbe7e3] cursor-pointer hover:bg-[#113028]"
              >
                Bills
              </a>
              <a
                href="/vendors"
                className="p-[11px_12px] rounded-lg text-[#dbe7e3] cursor-pointer hover:bg-[#113028]"
              >
                Vendors
              </a>
              <a
                href="/settings"
                className="p-[11px_12px] rounded-lg text-[#dbe7e3] cursor-pointer hover:bg-[#113028]"
              >
                Settings
              </a>
            </nav>
          </aside>

          {/* Main content — takes remaining width, fully scrollable */}
          <div className="flex-1 min-w-0 overflow-y-auto h-full">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
