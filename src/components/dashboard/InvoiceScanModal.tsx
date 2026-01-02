"use client";

import Image from 'next/image';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FileSearch, X, Camera, Sparkles, Loader2, FileText } from 'lucide-react';

interface InvoiceScanModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    selectedFile: string | null;
    isScanning: boolean;
    invoiceFeedback: string;
    onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onAnalyze: () => void;
    onReset: () => void;
}

export default function InvoiceScanModal({
    open,
    onOpenChange,
    selectedFile,
    isScanning,
    invoiceFeedback,
    onFileChange,
    onAnalyze,
    onReset,
}: InvoiceScanModalProps) {
    const isPDF = selectedFile?.startsWith('data:application/pdf');

    return (
        <Dialog open={open} onOpenChange={(isOpen) => {
            onOpenChange(isOpen);
            if (!isOpen) onReset();
        }}>
            <DialogContent className="bg-white w-full max-w-2xl h-[90vh] sm:h-auto overflow-y-auto rounded-t-[4rem] sm:rounded-[4rem] p-12 shadow-2xl border-none data-[state=open]:sm:animate-in data-[state=open]:sm:slide-in-from-bottom-12 data-[state=open]:sm:duration-500">
                <DialogHeader className="flex flex-row justify-between items-center mb-10">
                    <DialogTitle className="text-3xl font-black text-slate-800 flex items-center gap-4 italic tracking-tighter uppercase">
                        <FileSearch className="w-8 h-8 text-primary" /> Analyse Facture
                    </DialogTitle>
                    <div className="sr-only">Téléchargez une photo ou un PDF de votre facture pour une analyse par l'IA expert Mercedes.</div>
                </DialogHeader>

                {!selectedFile ? (
                    <div className="flex flex-col gap-6">
                        <label className="border-4 border-dashed border-slate-100 rounded-[4rem] p-24 flex flex-col items-center justify-center cursor-pointer hover:border-primary/20 hover:bg-primary/5 transition-all group">
                            <Camera className="w-20 h-20 text-slate-200 group-hover:text-primary/30 mb-8 transition-all" />
                            <div className="text-center">
                                <span className="text-slate-400 font-black uppercase text-sm tracking-[0.2em] block">Photo ou PDF</span>
                                <span className="text-slate-300 text-[10px] font-bold uppercase mt-2 block">Formats: JPG, PNG, PDF</span>
                            </div>
                            <Input type="file" accept="image/*,application/pdf" onChange={onFileChange} className="hidden" />
                        </label>
                        <div className="flex items-center gap-6 py-4 opacity-40">
                            <div className="flex-1 h-px bg-slate-200" />
                            <span className="text-[11px] font-black uppercase tracking-widest">Contrôle Qualité OM 654</span>
                            <div className="flex-1 h-px bg-slate-200" />
                        </div>
                    </div>
                ) : (
                    <div className="space-y-10">
                        <div className="relative rounded-[3rem] overflow-hidden h-64 bg-slate-50 border border-slate-100 shadow-inner flex items-center justify-center">
                            {isPDF ? (
                                <div className="flex flex-col items-center gap-4">
                                    <FileText className="w-24 h-24 text-primary opacity-20" />
                                    <span className="text-slate-400 font-black uppercase text-xs tracking-widest">Document PDF chargé</span>
                                </div>
                            ) : (
                                <Image src={selectedFile} alt="Facture" layout="fill" className="object-contain p-4" />
                            )}
                            <Button onClick={onReset} variant="destructive" size="icon" className="absolute top-6 right-6 p-3 rounded-full shadow-2xl active:scale-90 h-12 w-12 z-10"><X className="w-5 h-5" /></Button>
                        </div>

                        {!invoiceFeedback && !isScanning && (
                            <Button
                                onClick={onAnalyze}
                                className="w-full bg-primary text-primary-foreground font-black py-6 rounded-[2rem] shadow-2xl flex items-center justify-center gap-4 uppercase tracking-[0.2em] text-lg active:scale-95 transition-all h-auto"
                            >
                                <Sparkles className="w-6 h-6 text-accent" /> Décryptage Expert
                            </Button>
                        )}

                        {isScanning && (
                            <div className="p-16 text-center space-y-8">
                                <Loader2 className="w-16 h-16 animate-spin text-primary mx-auto" />
                                <p className="text-slate-500 font-black italic animate-pulse tracking-tight text-xl">L'IA Gemini analyse chaque ligne technique...</p>
                            </div>
                        )}

                        {invoiceFeedback && (
                            <div className="bg-primary/5 rounded-[3rem] p-10 text-[16px] text-slate-700 leading-relaxed border border-primary/10 whitespace-pre-wrap animate-in fade-in duration-700 shadow-inner">
                                <div className="flex items-center gap-3 mb-6 border-b border-primary/20 pb-5">
                                    <Sparkles className="w-5 h-5 text-primary" />
                                    <h4 className="font-black text-primary/80 uppercase text-[12px] tracking-widest leading-none">Rapport de Conformité Numérique</h4>
                                </div>
                                {invoiceFeedback}
                            </div>
                        )}
                    </div>
                )}

                <p className="mt-12 text-[10px] text-slate-300 text-center uppercase font-black tracking-[0.3em] leading-none opacity-40 italic">Sécurité des données garantie • Expertise Soignies</p>
            </DialogContent>
        </Dialog>
    );
}
