import type { Metadata } from "next";
import { Fraunces, Manrope } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
  axes: ["opsz"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Dashboard — La Maison de David",
  description:
    "Espace d'administration pour les bénévoles de La Maison de David.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${fraunces.variable} ${manrope.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans bg-cream text-ink">
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: "#fdf8ec",
              border: "1px solid rgba(17, 22, 43, 0.14)",
              color: "#11162b",
            },
          }}
        />
      </body>
    </html>
  );
}
