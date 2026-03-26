import { motion } from 'motion/react';

interface BrainrotMeterProps {
  level: number;
}

export default function BrainrotMeter({ level }: BrainrotMeterProps) {
  return (
    <div className="fixed right-4 top-1/2 -translate-y-1/2 z-50 hidden lg:flex flex-col items-center gap-4 pointer-events-none">
      <div className="h-64 w-8 border-4 border-black bg-white relative overflow-hidden shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
        <motion.div 
          className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-pink-500 via-yellow-400 to-green-400"
          style={{ height: `${level}%` }}
          layout
        />
      </div>
      <div className="bg-black text-white px-2 py-1 text-[10px] font-black uppercase transform rotate-90 origin-center whitespace-nowrap">
        Brainrot Level: {Math.floor(level)}%
      </div>
    </div>
  );
}
