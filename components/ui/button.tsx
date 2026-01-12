import Link from 'next/link';
import { cn } from '@/lib/utils';
import { ArrowRight } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    href?: string;
    variant?: 'primary' | 'outline' | 'ghost' | 'link';
    size?: 'sm' | 'md' | 'lg';
    withIcon?: boolean;
}

export const Button = ({
    className,
    variant = 'primary',
    size = 'md',
    withIcon = false,
    href,
    children,
    ...props
}: ButtonProps) => {
    const baseStyles = "inline-flex items-center justify-center font-bold tracking-wide transition-all duration-300 rounded-full group";

    const variants = {
        primary: "bg-[#FC6203] text-white hover:bg-orange-600 hover:scale-105 shadow-lg",
        outline: "border-2 border-[#FC6203] text-[#FC6203] hover:bg-[#FC6203] hover:text-white",
        ghost: "text-zinc-900 hover:text-[#FC6203] hover:bg-zinc-100",
        link: "text-[#FC6203] underline-offset-4 hover:underline",
    };

    const sizes = {
        sm: "px-4 py-2 text-sm",
        md: "px-6 py-3 text-base",
        lg: "px-8 py-4 text-lg",
    };

    const classes = cn(baseStyles, variants[variant], sizes[size], className);

    const content = (
        <>
            <span className="relative z-10">{children}</span>
            {withIcon && (
                <ArrowRight className="ml-2 w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
            )}
        </>
    );

    if (href) {
        return (
            <Link href={href} className={classes}>
                {content}
            </Link>
        );
    }

    return (
        <button className={classes} {...props}>
            {content}
        </button>
    );
};
