import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { WalletProvider } from "@/components/wallet/WalletProvider";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "Pet Health Passport",
  description: "Manage pets, reminders, and verifiable medical attestations.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${spaceGrotesk.variable} antialiased`}>
        <WalletProvider>
          <Providers>{children}</Providers>
        </WalletProvider>
      </body>
    </html>
  );
}
