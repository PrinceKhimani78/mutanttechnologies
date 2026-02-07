import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { ServiceMarquee } from "@/components/ServiceMarquee";
import { Ongoing } from "@/components/Ongoing";
import { Services } from "@/components/Services";
import { Testimonials } from "@/components/Testimonials";
import { About } from "@/components/About";
import { Contact } from "@/components/Contact";
import { Footer } from "@/components/Footer";
import { RenderBuilderContent } from "@/components/builder-page";

// Builder Public API Key set in .env.local
const BUILDER_PUBLIC_API_KEY = process.env.NEXT_PUBLIC_BUILDER_API_KEY || "YOUR_PUBLIC_API_KEY";
const model = "page";

import { supabase } from "@/lib/supabase";
import { Service } from "@/lib/types";
import { getMetadata } from "@/lib/seo";
import { Metadata } from "next";

export const revalidate = 60; // Revalidate every 60 seconds

export async function generateMetadata(): Promise<Metadata> {
  return await getMetadata('/', {
    title: "Mutant Technologies - Shine Bright Online",
    description: "We blend creativity and technology to boost your digital presence.",
  });
}

export default async function Home() {
  let content = undefined;

  try {
    const { builder } = await import("@builder.io/sdk");
    builder.init(BUILDER_PUBLIC_API_KEY);

    content = await builder
      .get(model, {
        userAttributes: {
          urlPath: "/",
        },
      })
      .toPromise();
  } catch (err) {
    console.error("Builder fetch error:", err);
  }

  const { data: services } = await supabase
    .from('services')
    .select('*')
    .order('id');

  const { data: testimonials } = await supabase
    .from('testimonials')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <main className="min-h-screen overflow-hidden">
      <Navbar />

      {content ? (
        <RenderBuilderContent content={content} model={model} />
      ) : (
        <>
          <Hero />
          <ServiceMarquee />
          <Ongoing />
          <Services services={(services || []) as Service[]} />
          <Testimonials initialData={testimonials || []} />
          <About />
          <Contact />
        </>
      )}

      <Footer />
    </main>
  );
}
