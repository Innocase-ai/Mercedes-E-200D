"use client";

import React from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CarDetails } from '@/lib/types';
import { Scale, Zap, Calendar, Save, Disc, Droplets, Tag, FileText, Euro } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface TechnicalSpecsProps {
    details: CarDetails;
    onUpdateDetails: (details: CarDetails) => void;
}

export default function TechnicalSpecs({ details, onUpdateDetails }: TechnicalSpecsProps) {
    // We use a string-based local state to give the user full control over what they type
    // (especially for leading zeros, decimal points, and clearing fields).
    const [formState, setFormState] = React.useState({
        mma: details.mma?.toString() || '',
        puissanceFiscale: details.puissanceFiscale?.toString() || '',
        nextTechnicalInspection: details.nextTechnicalInspection || '',
        tireSize: details.tireSize || '',
        tireBrand: details.tireBrand || '',
        tirePrice: details.tirePrice?.toString() || '',
        oilType: details.oilType || '',
        oilBrand: details.oilBrand || '',
        oilPrice: details.oilPrice?.toString() || '',
        notes: details.notes || ''
    });

    React.useEffect(() => {
        setFormState({
            mma: details.mma?.toString() || '',
            puissanceFiscale: details.puissanceFiscale?.toString() || '',
            nextTechnicalInspection: details.nextTechnicalInspection || '',
            tireSize: details.tireSize || '',
            tireBrand: details.tireBrand || '',
            tirePrice: details.tirePrice?.toString() || '',
            oilType: details.oilType || '',
            oilBrand: details.oilBrand || '',
            oilPrice: details.oilPrice?.toString() || '',
            notes: details.notes || ''
        });
    }, [details]);

    const handleInputChange = (field: string, value: string) => {
        setFormState(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = () => {
        const updatedDetails: CarDetails = {
            mma: parseInt(formState.mma) || 0,
            puissanceFiscale: parseInt(formState.puissanceFiscale) || 0,
            nextTechnicalInspection: formState.nextTechnicalInspection,
            tireSize: formState.tireSize,
            tireBrand: formState.tireBrand,
            tirePrice: parseFloat(formState.tirePrice) || 0,
            oilType: formState.oilType,
            oilBrand: formState.oilBrand,
            oilPrice: parseFloat(formState.oilPrice) || 0,
            notes: formState.notes
        };
        onUpdateDetails(updatedDetails);
    };

    return (
        <div className="px-4 sm:px-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div>
                <h2 className="text-2xl font-black italic tracking-tighter uppercase text-slate-800 px-2 mb-6">Fiche Technique</h2>

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
                                type="text"
                                inputMode="numeric"
                                value={formState.mma}
                                onChange={(e) => handleInputChange('mma', e.target.value)}
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
                                type="text"
                                inputMode="numeric"
                                value={formState.puissanceFiscale}
                                onChange={(e) => handleInputChange('puissanceFiscale', e.target.value)}
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
                                value={formState.nextTechnicalInspection}
                                onChange={(e) => handleInputChange('nextTechnicalInspection', e.target.value)}
                                className="text-2xl font-black h-16 rounded-2xl border-2 border-slate-50 focus-visible:ring-primary/20 focus-visible:border-primary transition-all bg-slate-50/30"
                            />
                            <p className="text-[11px] text-slate-400 font-medium px-2 italic">Date limite pour le passage au centre de contrôle.</p>
                        </div>
                    </Card>
                </div>
            </div>

            <div>
                <h2 className="text-2xl font-black italic tracking-tighter uppercase text-slate-800 px-2 mb-6">Pense-bête (Consommables)</h2>

                <div className="grid gap-6 sm:grid-cols-2">
                    {/* Tire Info */}
                    <Card className="p-6 rounded-[2rem] shadow-xl border-slate-100 bg-white group hover:shadow-2xl transition-all duration-300">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-3 rounded-2xl bg-slate-100 text-slate-600 group-hover:scale-110 transition-transform">
                                <Disc className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Pneumatiques</p>
                                <h3 className="text-lg font-bold text-slate-900">Dimensions & Marque</h3>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Taille</Label>
                                    <Input
                                        placeholder="ex: 245/45 R18"
                                        value={formState.tireSize}
                                        onChange={(e) => handleInputChange('tireSize', e.target.value)}
                                        className="font-bold h-12 rounded-xl border-2 border-slate-50 focus-visible:ring-primary/20 transition-all bg-slate-50/30"
                                    />
                                </div>
                                <div>
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Marque</Label>
                                    <Input
                                        placeholder="ex: Michelin"
                                        value={formState.tireBrand}
                                        onChange={(e) => handleInputChange('tireBrand', e.target.value)}
                                        className="font-bold h-12 rounded-xl border-2 border-slate-50 focus-visible:ring-primary/20 transition-all bg-slate-50/30"
                                    />
                                </div>
                            </div>
                            <div>
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Prix Estimé (€)</Label>
                                <div className="relative">
                                    <Input
                                        type="text"
                                        inputMode="decimal"
                                        placeholder="0"
                                        value={formState.tirePrice}
                                        onChange={(e) => handleInputChange('tirePrice', e.target.value)}
                                        className="font-bold h-12 rounded-xl border-2 border-slate-50 focus-visible:ring-primary/20 transition-all bg-slate-50/30 pl-10"
                                    />
                                    <Euro className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Oil Info */}
                    <Card className="p-6 rounded-[2rem] shadow-xl border-slate-100 bg-white group hover:shadow-2xl transition-all duration-300">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-3 rounded-2xl bg-yellow-100 text-yellow-600 group-hover:scale-110 transition-transform">
                                <Droplets className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Lubrifiant</p>
                                <h3 className="text-lg font-bold text-slate-900">Type d'Huile & Marque</h3>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Type / Norme</Label>
                                    <Input
                                        placeholder="ex: 5W30"
                                        value={formState.oilType}
                                        onChange={(e) => handleInputChange('oilType', e.target.value)}
                                        className="font-bold h-12 rounded-xl border-2 border-slate-50 focus-visible:ring-primary/20 transition-all bg-slate-50/30"
                                    />
                                </div>
                                <div>
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Marque</Label>
                                    <Input
                                        placeholder="ex: Castrol"
                                        value={formState.oilBrand}
                                        onChange={(e) => handleInputChange('oilBrand', e.target.value)}
                                        className="font-bold h-12 rounded-xl border-2 border-slate-50 focus-visible:ring-primary/20 transition-all bg-slate-50/30"
                                    />
                                </div>
                            </div>
                            <div>
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Prix au Litre (€)</Label>
                                <div className="relative">
                                    <Input
                                        type="text"
                                        inputMode="decimal"
                                        placeholder="0"
                                        value={formState.oilPrice}
                                        onChange={(e) => handleInputChange('oilPrice', e.target.value)}
                                        className="font-bold h-12 rounded-xl border-2 border-slate-50 focus-visible:ring-primary/20 transition-all bg-slate-50/30 pl-10"
                                    />
                                    <Euro className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Notes */}
                    <Card className="p-6 rounded-[2rem] shadow-xl border-slate-100 bg-white group hover:shadow-2xl transition-all duration-300 sm:col-span-2">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-3 rounded-2xl bg-emerald-100 text-emerald-600 group-hover:scale-110 transition-transform">
                                <FileText className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Mémo</p>
                                <h3 className="text-lg font-bold text-slate-900">Notes Libres</h3>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Textarea
                                placeholder="Autres informations importantes..."
                                value={formState.notes}
                                onChange={(e) => handleInputChange('notes', e.target.value)}
                                className="font-medium min-h-[100px] rounded-xl border-2 border-slate-50 focus-visible:ring-primary/20 transition-all bg-slate-50/30 resize-none"
                            />
                        </div>
                    </Card>
                </div>
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
