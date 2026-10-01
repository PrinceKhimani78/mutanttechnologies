"use client";
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

export const Testimonials = ({
  scroller,
  initialData = [],
}: {
  scroller?: string;
  initialData?: any[];
}) => {
  const marqueeRef = useRef<HTMLDivElement>(null);
  const tweenRef = useRef<gsap.core.Tween | null>(null);
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
    // fetchTestimonials();
  }, []);

  // Use default testimonials if both DB and initialData are empty
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

      const track = marqueeRef.current;
      if (!track || items.length === 0) return;

      // Reset track position
      gsap.set(track, { x: 0 });

      // Calculate half width for seamless infinite loop of duplicated items
      const totalWidth = track.scrollWidth / 2;

      // Smooth, easy-to-read speed (~30px per second)
      const duration = Math.max(180, totalWidth / 30);

      const tween = gsap.to(track, {
        x: -totalWidth,
        duration: duration,
        ease: "none",
        repeat: -1,
      });

      tweenRef.current = tween;

      return () => {
        tween.kill();
      };
    },
    { scope: marqueeRef, dependencies: [items] },
  );

  const handleMouseEnter = () => {
    tweenRef.current?.pause();
  };

  const handleMouseLeave = () => {
    tweenRef.current?.resume();
  };

  return (
    <section className="py-12 md:py-24 bg-background overflow-hidden relative">
      <div className="container mx-auto px-6 mb-8 md:mb-12">
        <h2 className="text-4xl md:text-6xl font-oswald font-bold uppercase text-foreground mb-4">
          Client Testimonials{" "}
          <span className="text-primary">That Drive Success</span>
        </h2>
        <div className="w-20 h-1 bg-gray-200 dark:bg-zinc-800"></div>
      </div>

      {/* Overflow wrapper with ample vertical padding to prevent card and shadow clipping */}
      <div 
        className="relative w-full overflow-hidden py-8 md:py-12"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleMouseEnter}
        onTouchEnd={handleMouseLeave}
      >
        {/* Soft edge gradient masks */}
        <div className="absolute left-0 top-0 bottom-0 w-20 md:w-36 bg-gradient-to-r from-background via-background/80 to-transparent pointer-events-none z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-20 md:w-36 bg-gradient-to-l from-background via-background/80 to-transparent pointer-events-none z-10" />

        <div className="flex w-fit items-stretch" ref={marqueeRef}>
          {/* Render two identical sets of items for a seamless infinite loop */}
          {[...items, ...items].map((t: any, i: number) => (
            <div 
              key={`testimonial-${i}`} 
              className="w-[320px] sm:w-[380px] md:w-[420px] shrink-0 px-3 md:px-4 flex flex-col"
            >
              <div className="bg-white dark:bg-zinc-800/50 border border-t-[6px] border-t-primary border-x-transparent border-b-transparent p-6 md:p-8 rounded-2xl h-full flex flex-col justify-between relative group hover:-translate-y-2 transition-all duration-300 shadow-xl hover:shadow-2xl dark:shadow-none">
                <div>
                  <div className="flex items-center gap-4 mb-5">
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, starIdx) => (
                        <Star
                          key={starIdx}
                          className="w-4 h-4 fill-orange-500 text-orange-500"
                        />
                      ))}
                    </div>
                  </div>

                  <p className="text-gray-700 dark:text-zinc-300 text-base md:text-lg leading-relaxed mb-6">
                    "{t.quote}"
                  </p>
                </div>

                <div className="flex items-center justify-between border-t border-gray-100 dark:border-zinc-800 pt-5 mt-auto">
                  <div>
                    <div className="text-dark-slate dark:text-white font-bold text-base md:text-lg uppercase font-oswald">
                      {t.author}
                    </div>
                    <div className="text-gray-500 dark:text-zinc-500 text-xs md:text-sm">
                      {t.role}
                    </div>
                  </div>
                  <Quote className="w-7 h-7 md:w-8 md:h-8 text-gray-300 dark:text-zinc-700 group-hover:text-primary transition-colors" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

