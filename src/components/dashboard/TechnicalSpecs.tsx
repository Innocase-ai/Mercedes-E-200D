"use client";

import React from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CarDetails } from '@/lib/types';
import { Scale, Zap, Calendar, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TechnicalSpecsProps {
    details: CarDetails;
    onUpdateDetails: (details: CarDetails) => void;
}

export default function TechnicalSpecs({ details, onUpdateDetails }: TechnicalSpecsProps) {
    const [localDetails, setLocalDetails] = React.useState<CarDetails>(details);

    React.useEffect(() => {
        setLocalDetails(details);
    }, [details]);

    const handleChange = (field: keyof CarDetails, value: string | number) => {
        setLocalDetails(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = () => {
        onUpdateDetails(localDetails);
    };

    return (
        <div className="px-4 sm:px-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h2 className="text-2xl font-black italic tracking-tighter uppercase text-slate-800 px-2">Fiche Technique</h2>

            <div className="grid gap-6 sm:grid-cols-2">
                <Card className="p-6 rounded-[2rem] shadow-xl border-slate-100 bg-white group hover:shadow-2xl transition-all duration-300">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="p-3 rounded-2xl bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                            <Scale className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Masse Maximale</p>
                            <h3 className="text-lg font-bold text-slate-900">MMA (kg)</h3>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Input
                            type="number"
                            value={localDetails.mma}
                            onChange={(e) => handleChange('mma', parseInt(e.target.value) || 0)}
                            className="text-2xl font-black h-16 rounded-2xl border-2 border-slate-50 focus-visible:ring-primary/20 focus-visible:border-primary transition-all bg-slate-50/30"
                        />
                        <p className="text-[11px] text-slate-400 font-medium px-2 italic">Masse maximale autorisée du véhicule.</p>
                    </div>
                </Card>

                <Card className="p-6 rounded-[2rem] shadow-xl border-slate-100 bg-white group hover:shadow-2xl transition-all duration-300">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="p-3 rounded-2xl bg-amber-100 text-amber-600 group-hover:scale-110 transition-transform">
                            <Zap className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Administration</p>
                            <h3 className="text-lg font-bold text-slate-900">Puissance Fiscale</h3>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Input
                            type="number"
                            value={localDetails.puissanceFiscale}
                            onChange={(e) => handleChange('puissanceFiscale', parseInt(e.target.value) || 0)}
                            className="text-2xl font-black h-16 rounded-2xl border-2 border-slate-50 focus-visible:ring-primary/20 focus-visible:border-primary transition-all bg-slate-50/30"
                        />
                        <p className="text-[11px] text-slate-400 font-medium px-2 italic">Chevaux fiscaux (CV) pour la carte grise.</p>
                    </div>
                </Card>

                <Card className="p-6 rounded-[2rem] shadow-xl border-slate-100 bg-white group hover:shadow-2xl transition-all duration-300 sm:col-span-2">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="p-3 rounded-2xl bg-blue-100 text-blue-600 group-hover:scale-110 transition-transform">
                            <Calendar className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Échéance Critique</p>
                            <h3 className="text-lg font-bold text-slate-900">Prochain Contrôle Technique</h3>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Input
                            type="date"
                            value={localDetails.nextTechnicalInspection}
                            onChange={(e) => handleChange('nextTechnicalInspection', e.target.value)}
                            className="text-2xl font-black h-16 rounded-2xl border-2 border-slate-50 focus-visible:ring-primary/20 focus-visible:border-primary transition-all bg-slate-50/30"
                        />
                        <p className="text-[11px] text-slate-400 font-medium px-2 italic">Date limite pour le passage au centre de contrôle.</p>
                    </div>
                </Card>
            </div>

            <div className="flex justify-end pt-4">
                <Button
                    onClick={handleSave}
                    className="h-16 px-8 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black uppercase tracking-widest flex items-center gap-3 shadow-xl active:scale-95 transition-all"
                >
                    <Save className="w-5 h-5" />
                    Enregistrer les données
                </Button>
            </div>
        </div>
    );
}
