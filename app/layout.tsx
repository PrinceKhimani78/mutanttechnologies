import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Oswald } from "next/font/google"; // Oswald for Headers
import { SmoothScroll } from "@/components/SmoothScroll";
import { CustomCursor } from "@/components/CustomCursor";
import { Preloader } from "@/components/Preloader";
import { ThemeProvider } from "@/components/theme-provider";
import { GoogleTagManager, GoogleAnalytics } from '@next/third-parties/google';
import { Analytics } from "@vercel/analytics/next";
import Script from "next/script";
import { WhatsAppButton } from "@/components/WhatsAppButton";
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
    default: "Mutant Technologies | IT & Digital Agency in Rajkot",
  },
  description: "Mutant Technologies is a premier IT & digital agency in Rajkot offering web development, mobile apps, SEO, digital marketing, and white label solutions.",
  authors: [{ name: "Mutant Technologies" }],
  metadataBase: new URL('https://www.mutanttechnologies.com'),
  openGraph: {
    title: "Mutant Technologies | IT & Digital Agency in Rajkot",
    description: "Mutant Technologies is a premier IT & digital agency in Rajkot offering web development, mobile apps, SEO, digital marketing, and white label solutions.",
    url: 'https://www.mutanttechnologies.com',
    siteName: 'Mutant Technologies',
    locale: 'en_US',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': 'https://www.mutanttechnologies.com/#organization',
        name: 'Mutant Technologies',
        url: 'https://www.mutanttechnologies.com',
        logo: 'https://www.mutanttechnologies.com/logo.png',
        founder: {
          '@type': 'Person',
          name: 'Prince Khimani',
        },
        foundingDate: '2023',
        sameAs: [
          'https://www.linkedin.com/company/mutant-technologies',
          'https://www.instagram.com/mutanttechnologies',
        ],
        contactPoint: {
          '@type': 'ContactPoint',
          telephone: '+91 9879846695',
          contactType: 'customer service',
          areaServed: 'Worldwide',
          availableLanguage: ['English', 'Hindi', 'Gujarati'],
        },
      },
      {
        '@type': ['LocalBusiness', 'ProfessionalService'],
        '@id': 'https://www.mutanttechnologies.com/#localbusiness',
        name: 'Mutant Technologies',
        url: 'https://www.mutanttechnologies.com',
        logo: 'https://www.mutanttechnologies.com/logo.png',
        image: 'https://www.mutanttechnologies.com/logo.png',
        telephone: '+91 9879846695',
        priceRange: '$$',
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Rajkot',
          addressRegion: 'Gujarat',
          postalCode: '360005',
          addressCountry: 'IN',
        },
        geo: {
          '@type': 'GeoCoordinates',
          latitude: '22.3039',
          longitude: '70.8022',
        },
        openingHoursSpecification: [
          {
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
            opens: '09:00',
            closes: '19:00',
          },
        ],
        areaServed: [
          { '@type': 'Country', name: 'Worldwide' },
          { '@type': 'Country', name: 'United States' },
          { '@type': 'Country', name: 'Canada' },
          { '@type': 'Country', name: 'United Kingdom' },
          { '@type': 'Country', name: 'Australia' },
          { '@type': 'Country', name: 'India' },
        ],
      },
    ],
  };

  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <body
        className={`${plusJakarta.variable} ${oswald.variable} font-sans antialiased overflow-x-hidden`}
        suppressHydrationWarning
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
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
          <WhatsAppButton />
        </ThemeProvider>
        <Analytics />
      </body>
      <GoogleTagManager gtmId="GTM-MG6PRBMP" />
      <GoogleAnalytics gaId="G-VYNDWPNV0G" />
      <Script src="/mutant-pixel.js" data-client-id="bdcbd54a-51b9-499f-8598-34c79124f9a4" strategy="afterInteractive" />
    </html>
  );
}
