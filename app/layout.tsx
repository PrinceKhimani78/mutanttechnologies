import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Oswald } from "next/font/google"; // Oswald for Headers
import { SmoothScroll } from "@/components/SmoothScroll";
import { CustomCursor } from "@/components/CustomCursor";
import { Preloader } from "@/components/Preloader";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  weight: ["300", "400", "500", "600", "700", "800"],
});

const oswald = Oswald({
  subsets: ["latin"],
  variable: "--font-oswald",
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: {
    template: "%s | Mutant Technologies",
    default: "Mutant Technologies - Shine Bright Online",
  },
  description: "Creative, bold, future-focused digital agency. Web Development, SEO, Digital Marketing, and Cyber Security services.",
  keywords: ["Digital Agency", "Web Development", "SEO", "Mutant Technologies", "Cyber Security"],
  authors: [{ name: "Mutant Technologies" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <body
        className={`${plusJakarta.variable} ${oswald.variable} font-sans antialiased overflow-x-hidden`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <Preloader />
          <SmoothScroll>
            <CustomCursor />
            {children}
          </SmoothScroll>
        </ThemeProvider>
      </body>
    </html>
  );
}
