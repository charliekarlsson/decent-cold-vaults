import type { Metadata } from "next";
import { Fredoka, DM_Sans } from "next/font/google";
import { Header } from "@/components/layout/header";
import { StoreProvider } from "@/components/providers/store-provider";
import { SmoothScroll } from "@/components/providers/smooth-scroll";
import "./globals.css";

const fredoka = Fredoka({
  variable: "--font-fredoka",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Decent — Decentralized Private Cloud Storage",
  description:
    "De-centralized storage. Secure Wallet Login. Cold Storage Encryption.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${fredoka.variable} ${dmSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col page-bg">
        <SmoothScroll>
          <StoreProvider>
            <Header />
            <main className="flex-1">{children}</main>
          </StoreProvider>
        </SmoothScroll>
      </body>
    </html>
  );
}
