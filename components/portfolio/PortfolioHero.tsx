export const PortfolioHero = ({ title = "Our Work", subtitle = "A showcase of digital experiences we've crafted for brands that dare to be different." }: { title?: string, subtitle?: string }) => {
    return (
        <div className="pt-32 pb-20 px-6 container mx-auto text-center">
            <h1 className="text-5xl md:text-7xl font-oswald font-bold uppercase mb-8">{title}</h1>
            <p className="text-xl text-zinc-400 max-w-2xl mx-auto mb-12">
                {subtitle}
            </p>
        </div>
    );
};
