
"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface MileageUpdateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentMileage: number;
  onUpdateMileage: (newMileage: number) => void;
}

export default function MileageUpdateModal({ open, onOpenChange, currentMileage, onUpdateMileage }: MileageUpdateModalProps) {
  const [newMileage, setNewMileage] = useState('');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMileage) {
      onUpdateMileage(parseInt(newMileage, 10));
      setNewMileage('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white w-full max-w-sm rounded-t-[3rem] sm:rounded-[4rem] p-10 sm:p-14 shadow-2xl border-none data-[state=open]:sm:animate-in data-[state=open]:sm:slide-in-from-bottom-12 data-[state=open]:sm:duration-500">
        <div className="w-16 h-1.5 sm:w-20 sm:h-2 bg-slate-100 rounded-full mx-auto mb-8 sm:mb-12 sm:hidden" />
        <DialogHeader className="mb-8 sm:mb-12 text-center">
          <DialogTitle className="text-xl sm:text-2xl font-black text-center text-slate-800 tracking-tighter italic uppercase underline underline-offset-8 decoration-primary">Relevé Compteur</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="relative mb-10 sm:mb-14 text-center">
            <Input
              autoFocus
              type="number"
              placeholder={isClient ? currentMileage.toLocaleString() : String(currentMileage)}
              value={newMileage}
              onChange={(e) => setNewMileage(e.target.value)}
              className="w-full h-auto text-5xl sm:text-8xl font-black text-slate-900 border-none outline-none text-center bg-transparent tracking-tighter p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
              min={currentMileage}
            />
            <p className="text-slate-200 font-black uppercase tracking-[0.5em] sm:tracking-[1em] mt-4 sm:mt-6 text-[10px] sm:text-[11px]">UNITÉ : KM</p>
          </div>
          <div className="flex flex-col gap-4 sm:gap-5">
            <Button type="submit" className="w-full bg-primary text-primary-foreground font-black py-5 sm:py-7 rounded-[2rem] sm:rounded-[3rem] text-xl sm:text-2xl shadow-2xl shadow-blue-200 uppercase tracking-widest active:scale-95 transition-all h-auto">Mettre à jour</Button>
            <Button type="button" onClick={() => onOpenChange(false)} variant="ghost" className="w-full text-slate-300 font-black py-4 uppercase text-xs tracking-widest">Fermer</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
