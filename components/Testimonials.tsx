"use client";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Quote, Star } from "lucide-react";
import { useRef, useState, useEffect } from "react";

const defaultTestimonials = [
  {
    quote: "Mutant Technologies completely transformed our digital footprint. Their innovative strategies have helped us reach thousands of new clients with ease.",
    author: "Jason Jordan",
    role: "EXP Realty",
  },
  {
    quote: "Their team's in-depth understanding of digital marketing propelled our platform to new heights. Mutant is a reliable, forward-thinking tech partner.",
    author: "Kuldeep Chauhan",
    role: "Ultron Financials",
  },
  {
    quote: "Working with Mutant Technologies has been a game-changer. They built a tailored solution that perfectly streamlined our internal processes and outreach.",
    author: "Katie Spadoro",
    role: "CYB Human Resources",
  },
  {
    quote: "We needed a top-tier digital strategy and Mutant delivered on every single promise. We highly recommend their expertise in UI/UX and web development.",
    author: "Varun Celly",
    role: "Geeks of Digital",
  },
  {
    quote: "From start to finish, the Mutant team provided stellar service and results. Their dedication to our growth made a remarkable difference in our organic traffic.",
    author: "Khushi Desai",
    role: "Rojgari India",
  },
  {
    quote: "The strategic insights from Mutant Technologies significantly enhanced our digital presence. They truly know how to explore the infinity of the web.",
    author: "Prem",
    role: "Web 99",
  },
  {
    quote: "Nicolas and his team saw immense value in Mutant's approach. They completely elevated our online marketing funnel and brand visibility.",
    author: "Nicolas Boucher",
    role: "NB",
  },
  {
    quote: "Their team brought a fresh perspective to our brand. Our new digital presence perfectly encapsulates the essence of what we stand for.",
    author: "Jocelyn Greenky",
    role: "Sider Road",
  },
  {
    quote: "Mutant Technologies understood our vision for sustainability and translated it perfectly into a beautiful, high-performing website.",
    author: "Dhruvin Sojitra",
    role: "Greenminds India",
  },
  {
    quote: "As a creative agency, we needed a tech partner that matched our energy. Mutant exceeded our expectations at every turn with their flawless execution.",
    author: "Kristen Leaman",
    role: "Indie Collaborates",
  },
  {
    quote: "The gaming and community platform they built for us is incredibly robust. Their technical expertise is unmatched in the industry.",
    author: "David Walters",
    role: "LIG Legends",
  },
  {
    quote: "Mutant took our branding and elevated it to a global standard. The seamless web experience they delivered has dramatically boosted our sales.",
    author: "Roshni Dutt",
    role: "Cream",
  },
  {
    quote: "We wanted a clean, professional, and patient-friendly website. Mutant delivered exactly that, helping us significantly increase our monthly bookings.",
    author: "Navjot Brar",
    role: "One Dental",
  },
  {
    quote: "Their marketing automation and web design services gave us the exact push we needed in a competitive market. A highly professional team.",
    author: "Rolonda Watts",
    role: "Rolonda",
  },
  {
    quote: "The custom e-commerce solution they built is incredibly fast and user-friendly. Our conversion rates have skyrocketed since the launch.",
    author: "Sally",
    role: "Sally",
  },
  {
    quote: "Jewelry requires a visually stunning digital storefront. Mutant Technologies crafted an elegant website that perfectly showcases our collections.",
    author: "LJ Hermoso",
    role: "Slide Jewels",
  },
  {
    quote: "They helped us build a community-focused platform with incredible precision. Working with Mutant has been an absolute pleasure from day one.",
    author: "Simona L.",
    role: "Turning Towards",
  },
  {
    quote: "Security and reliability are paramount in healthcare tech. Mutant delivered a flawless digital solution that we and our patients can completely trust.",
    author: "Rakesh Desai",
    role: "XCare Pro",
  },
  {
    quote: "From branding to complex backend development, they handled our entire tech stack with incredible proficiency. Mutant is our absolute go-to digital partner.",
    author: "Shibin",
    role: "Zaikox",
  }
];

const fetchTestimonials = async () => {
  const { supabase } = await import("@/lib/supabase");
  const { data } = await supabase
    .from("testimonials")
    .select("*")
    .order("created_at", { ascending: false });
  return data || [];
};

export const Testimonials = ({
  scroller,
  initialData = [],
}: {
  scroller?: string;
  initialData?: any[];
}) => {
  const marqueeRef = useRef<HTMLDivElement>(null);
  const [testimonials, setTestimonials] = useState<any[]>(initialData);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const { supabase } = await import("@/lib/supabase");
        const { data, error } = await supabase
          .from("testimonials")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;
        if (data && data.length > 0) {
          setTestimonials(data);
        }
      } catch (err) {
        console.error("Error fetching testimonials:", err);
      }
    };
    // If we have initialData, we might still want to fetch for fresh data if cached
    // fetchTestimonials(); // Disabled to force showing the new local testimonials
  }, []);

  // Use default testimonials if both DB and initialData are empty
  // @ts-ignore
  const items = testimonials.length > 0 ? testimonials : defaultTestimonials;

  useGSAP(
    () => {
      // Disable GSAP animations in Visual Editor to prevent errors
      if (scroller) {
        console.log(
          "Testimonials: Skipping GSAP animations in Visual Editor context",
        );
        return;
      }

      // Clone the list to create seamless loop
      const list = marqueeRef.current;
      if (list && items.length > 0) {
        const content = list.innerHTML;
        list.innerHTML = content + content + content + content; // Repeat enough times

        const width = list.scrollWidth / 2;

        gsap.to(list, {
          x: -width,
          duration: 120,
          ease: "none",
          repeat: -1,
        });
      }
    },
    { scope: marqueeRef, dependencies: [items] },
  );

  return (
    <section className="py-12 md:py-24 bg-background overflow-hidden relative">
      <div className="container mx-auto px-6 mb-16">
        <h2 className="text-4xl md:text-6xl font-oswald font-bold uppercase text-foreground mb-4">
          Client Testimonials{" "}
          <span className="text-primary">That Drive Success</span>
        </h2>
        <div className="w-20 h-1 bg-gray-200 dark:bg-zinc-800"></div>
      </div>

      <div className="relative w-full overflow-hidden">
        {/* Gradient Masks */}
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-linear-to-r from-gray-50 via-gray-50/50 dark:from-zinc-950 dark:via-zinc-950/50 to-transparent z-10"></div>
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-linear-to-l from-gray-50 via-gray-50/50 dark:from-zinc-950 dark:via-zinc-950/50 to-transparent z-10"></div>

        <div className="flex w-fit" ref={marqueeRef}>
          {items.map((t: any, i: number) => (
            <div key={i} className="w-[400px] shrink-0 px-6">
              <div className="bg-white dark:bg-zinc-800/50 border border-t-[6px] border-t-primary border-x-transparent border-b-transparent p-8 rounded-2xl h-full relative group hover:-translate-y-2 transition-transform duration-300 shadow-xl dark:shadow-none">
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-4 h-4 fill-orange-500 text-orange-500"
                      />
                    ))}
                  </div>
                </div>

                <p className="text-gray-700 dark:text-zinc-300 text-lg leading-relaxed mb-8 flex-1">
                  "{t.quote}"
                </p>

                <div className="flex items-center justify-between border-t border-gray-100 dark:border-zinc-800 pt-6">
                  <div>
                    <div className="text-dark-slate dark:text-white font-bold text-lg uppercase font-oswald">
                      {t.author}
                    </div>
                    <div className="text-gray-500 dark:text-zinc-500 text-sm">
                      {t.role}
                    </div>
                  </div>
                  <Quote className="w-8 h-8 text-gray-300 dark:text-zinc-700 group-hover:text-primary transition-colors" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
