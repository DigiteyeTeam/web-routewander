import type { Metadata } from "next";
import { Inter, Noto_Sans_Thai } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { BookingsProvider } from "@/context/BookingsContext";
import { LocaleProvider } from "@/context/LocaleContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { MockAuthProvider } from "@/context/MockAuthContext";
import SessionProvider from "@/components/SessionProvider";
import ChatBot from "@/components/ChatBot";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
});

const notoSansThai = Noto_Sans_Thai({
  subsets: ["latin", "thai"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-noto-thai",
});

export const metadata: Metadata = {
  title: "Route Wander | Tours & Activities in Thailand",
  description:
    "Discover and book tours, activities, and experiences across Thailand. Route Wander — tours led by local Thai guides for international travelers.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" className={`${inter.variable} ${notoSansThai.variable}`}>
      <body className="font-sans">
        <LocaleProvider>
          <WishlistProvider>
            <MockAuthProvider>
              <SessionProvider>
                <CartProvider>
                <BookingsProvider>
                  {children}
                  <ChatBot />
                </BookingsProvider>
              </CartProvider>
              </SessionProvider>
            </MockAuthProvider>
          </WishlistProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
