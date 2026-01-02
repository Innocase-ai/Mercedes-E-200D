import Image from 'next/image';
import { FileSearch } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  carImageUrl: string;
  onScanClick: () => void;
}

export default function Header({ carImageUrl, onScanClick }: HeaderProps) {
  return (
    <header className="relative bg-slate-900">
      <div className="relative h-64 sm:h-[25rem] overflow-hidden">
        {carImageUrl && (
          <Image
            src={carImageUrl}
            alt="Mercedes E-Class"
            fill
            className="object-cover"
            priority
            data-ai-hint="mercedes car"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-8 flex justify-between items-end">
        <div>
          <h1 className="text-white text-4xl sm:text-5xl font-black italic tracking-tighter drop-shadow-md font-headline">E 200 d</h1>
          <p className="text-primary-foreground/70 text-xs sm:text-[12px] font-black uppercase tracking-[0.3em] sm:tracking-[0.4em] drop-shadow-sm">Mercedes-Benz • Soignies</p>
        </div>
        <Button
          onClick={onScanClick}
          size="icon"
          className="bg-primary/90 backdrop-blur-md border border-primary-foreground/20 h-16 w-16 sm:h-20 sm:w-20 p-4 rounded-2xl text-white shadow-2xl active:scale-95 transition-all"
          title="Scanner une facture"
        >
          <FileSearch className="w-6 h-6 sm:w-7 sm:w-7" />
        </Button>
      </div>
    </header>
  );
}
