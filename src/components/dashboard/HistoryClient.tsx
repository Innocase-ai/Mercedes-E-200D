"use client";

import React, { useState, useMemo } from 'react';
import { MaintenanceRecord, Expense } from '@/lib/types';
import { Search, ChevronLeft, Calendar, Gauge, FileText, CheckCircle2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { formatMileage, formatCurrency } from '@/lib/utils';

interface HistoryClientProps {
    initialHistory: MaintenanceRecord[];
    initialExpenses: Expense[];
}

export default function HistoryClient({ initialHistory, initialExpenses }: HistoryClientProps) {
    const [search, setSearch] = useState("");

    const filteredHistory = useMemo(() => {
        if (!search) return initialHistory;
        const s = search.toLowerCase();
        return initialHistory.filter(h =>
            h.taskName.toLowerCase().includes(s) ||
            h.mileage.toString().includes(s)
        );
    }, [search, initialHistory]);

    const filteredExpenses = useMemo(() => {
        if (!search) return initialExpenses;
        const s = search.toLowerCase();
        return initialExpenses.filter(e =>
            e.label.toLowerCase().includes(s) ||
            e.analysis.toLowerCase().includes(s) ||
            e.type.toLowerCase().includes(s)
        );
    }, [search, initialExpenses]);

    return (
        <div className="min-h-screen bg-gray-50 text-slate-900 font-sans pb-20">
            {/* Header */}
            <div className="bg-slate-900 text-white p-6 pt-12 rounded-b-[3rem] shadow-2xl">
                <div className="max-w-4xl mx-auto flex items-center justify-between mb-8">
                    <Link href="/">
                        <Button variant="ghost" className="text-white hover:bg-white/10 rounded-full h-12 w-12 p-0">
                            <ChevronLeft className="w-6 h-6" />
                        </Button>
                    </Link>
                    <h1 className="text-2xl font-black italic tracking-tighter uppercase">Historique Complet</h1>
                    <div className="w-12" /> {/* Spacer */}
                </div>

                <div className="max-w-4xl mx-auto relative">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input
                        placeholder="Rechercher une pièce, un entretien..."
                        className="w-full bg-white/10 border-none h-14 pl-14 rounded-2xl text-white placeholder:text-slate-400 focus-visible:ring-primary/50"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="max-w-4xl mx-auto p-4 space-y-10 mt-6">
                {/* Simple History Items */}
                <section>
                    <div className="flex items-center gap-3 mb-6 px-2">
                        <CheckCircle2 className="w-5 h-5 text-primary" />
                        <h2 className="text-lg font-black uppercase tracking-tight text-slate-700">Tâches Réalisées</h2>
                    </div>

                    <div className="space-y-3">
                        {filteredHistory.length === 0 ? (
                            <p className="text-center py-10 text-slate-400 italic">Aucune tâche trouvée.</p>
                        ) : (
                            filteredHistory.map((item) => (
                                <div key={item.id} className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex items-center justify-between hover:shadow-md transition-shadow">
                                    <div>
                                        <h3 className="font-bold text-slate-800">{item.taskName}</h3>
                                        <div className="flex items-center gap-4 mt-1 text-xs text-slate-400 font-medium font-mono">
                                            <span className="flex items-center gap-1.5"><Gauge className="w-3.5 h-3.5" /> {formatMileage(item.mileage)}</span>
                                            {item.date && <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {item.date}</span>}
                                        </div>
                                    </div>
                                    <div className="h-10 w-10 bg-primary/5 text-primary rounded-xl flex items-center justify-center font-black italic text-xs">OK</div>
                                </div>
                            ))
                        )}
                    </div>
                </section>

                {/* Detailed Invoice Analyses */}
                <section>
                    <div className="flex items-center gap-3 mb-6 px-2">
                        <FileText className="w-5 h-5 text-primary" />
                        <h2 className="text-lg font-black uppercase tracking-tight text-slate-700">Analyses Factures & Pièces</h2>
                    </div>

                    <div className="space-y-4">
                        {filteredExpenses.length === 0 ? (
                            <p className="text-center py-10 text-slate-400 italic">Aucune facture trouvée.</p>
                        ) : (
                            filteredExpenses.map((expense) => (
                                <div key={expense.id} className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden hover:shadow-lg transition-all">
                                    <div className="p-6 border-b border-slate-50 flex justify-between items-start">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${expense.isConform ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                                    {expense.type}
                                                </span>
                                                <span className="text-slate-300 text-[10px] uppercase font-bold">{expense.date}</span>
                                            </div>
                                            <h3 className="font-bold text-slate-900">{expense.label}</h3>
                                        </div>
                                        <span className="font-black text-slate-900 bg-slate-50 px-3 py-1 rounded-full text-sm">{formatCurrency(expense.amount)}</span>
                                    </div>
                                    <div className="p-6 bg-slate-50/50">
                                        <p className="text-xs text-slate-600 leading-relaxed italic whitespace-pre-wrap">
                                            {expense.analysis}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
}
