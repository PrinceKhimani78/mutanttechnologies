import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Oswald } from "next/font/google"; // Oswald for Headers
import { SmoothScroll } from "@/components/SmoothScroll";
import { CustomCursor } from "@/components/CustomCursor";
import { Preloader } from "@/components/Preloader";
import { ThemeProvider } from "@/components/theme-provider";
import { GoogleTagManager, GoogleAnalytics } from '@next/third-parties/google';
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
  metadataBase: new URL('https://www.mutanttechnologies.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "Mutant Technologies - Shine Bright Online",
    description: "Creative, bold, future-focused digital agency.",
    url: 'https://www.mutanttechnologies.com',
    siteName: 'Mutant Technologies',
    locale: 'en_US',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Mutant Technologies',
    url: 'https://www.mutanttechnologies.com',
    logo: 'https://www.mutanttechnologies.com/logo.png', // Ensure this exists or update path
    sameAs: [
      'https://www.linkedin.com/company/mutant-technologies',
      'https://www.instagram.com/mutanttechnologies',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+91-1234567890', // Update with actual
      contactType: 'customer service',
    },
  };

  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <body
        className={`${plusJakarta.variable} ${oswald.variable} font-sans antialiased overflow-x-hidden`}
        suppressHydrationWarning
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <Preloader />
          <SmoothScroll>
            <CustomCursor />
            {children}
          </SmoothScroll>
        </ThemeProvider>
      </body>
      <GoogleTagManager gtmId="GTM-MG6PRBMP" />
      <GoogleAnalytics gaId="G-VYNDWPNV0G" />
    </html>
  );
}
