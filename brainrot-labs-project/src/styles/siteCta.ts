import { cn } from '../utils/cn';

type SiteCtaVariant = 'archive' | 'create';
type SiteCtaSize = 'sm' | 'md' | 'lg';

const baseClasses =
  'inline-flex items-center justify-center gap-2.5 whitespace-nowrap border-4 border-black text-center font-display font-black uppercase leading-[0.92] tracking-[-0.035em] transition-all duration-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-black focus-visible:ring-offset-2';

const sizeClasses: Record<SiteCtaSize, string> = {
  sm: 'px-4 py-2.5 text-[0.9rem] sm:px-5 sm:text-[0.95rem] shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none',
  md: 'px-5 py-3 text-[0.95rem] sm:px-6 sm:py-3.5 sm:text-[1.02rem] shadow-[6px_6px_0_0_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none',
  lg: 'px-6 py-4 text-[1rem] sm:px-7 sm:py-4.5 sm:text-[1.1rem] md:text-[1.2rem] shadow-[8px_8px_0_0_rgba(0,0,0,1)] hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none',
};

const variantClasses: Record<SiteCtaVariant, string> = {
  archive: 'bg-cyan-500 text-white',
  create: 'bg-pink-500 text-white',
};

export function getSiteCtaClasses(variant: SiteCtaVariant, size: SiteCtaSize = 'md', className?: string) {
  return cn(baseClasses, sizeClasses[size], variantClasses[variant], className);
}
