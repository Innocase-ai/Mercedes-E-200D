"use client";

import { Expense } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { Receipt, Calendar, Tag, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface ExpensesTableProps {
    expenses: Expense[];
}

export default function ExpensesTable({ expenses }: ExpensesTableProps) {
    const totalAmount = expenses.reduce((acc, curr) => acc + curr.amount, 0);

    return (
        <Card className="rounded-[2rem] sm:rounded-[3rem] p-6 sm:p-10 shadow-2xl shadow-slate-200/60 border-white/80 mt-12">
            <div className="flex justify-between items-center mb-10 px-2">
                <div>
                    <h2 className="text-2xl sm:text-3xl font-black text-slate-900 italic tracking-tighter uppercase">Mes Dépenses</h2>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Récapitulatif financier hors mazout</p>
                </div>
                <div className="text-right">
                    <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1">Total Cumulé</p>
                    <p className="text-3xl sm:text-4xl font-black text-primary tracking-tighter">{formatCurrency(totalAmount)}</p>
                </div>
            </div>

            <div className="overflow-x-auto -mx-2 sm:mx-0">
                <table className="w-full border-separate border-spacing-y-4">
                    <thead>
                        <tr className="text-left text-slate-300 text-[10px] font-black uppercase tracking-[0.2em]">
                            <th className="px-6 pb-2">Date</th>
                            <th className="px-6 pb-2">Libellé</th>
                            <th className="px-6 pb-2">Type</th>
                            <th className="px-6 pb-2 text-right">Montant</th>
                            <th className="px-6 pb-2 text-center">État</th>
                        </tr>
                    </thead>
                    <tbody>
                        {expenses.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="py-20 text-center text-slate-300 font-bold italic">
                                    Aucune dépense enregistrée pour le moment.
                                </td>
                            </tr>
                        ) : (
                            expenses.map((expense) => (
                                <tr key={expense.id} className="group bg-slate-50/50 hover:bg-white transition-all rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:shadow-slate-100 cursor-default border border-transparent hover:border-slate-100">
                                    <td className="px-6 py-5 first:rounded-l-[1.5rem] last:rounded-r-[1.5rem]">
                                        <div className="flex items-center gap-3">
                                            <Calendar className="w-4 h-4 text-slate-300" />
                                            <span className="text-sm font-bold text-slate-500">{expense.date}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className="text-sm font-black text-slate-800 tracking-tight">{expense.label}</span>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-2">
                                            <Tag className="w-4 h-4 text-slate-300" />
                                            <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">{expense.type}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <span className="text-base font-black text-slate-900">{formatCurrency(expense.amount)}</span>
                                    </td>
                                    <td className="px-6 py-5 last:rounded-r-[1.5rem]">
                                        <div className="flex justify-center">
                                            {expense.isConform ? (
                                                <div className="bg-green-100 text-green-600 p-1.5 rounded-full" title="Conforme">
                                                    <CheckCircle2 className="w-5 h-5" />
                                                </div>
                                            ) : (
                                                <div className="bg-slate-100 text-slate-400 p-1.5 rounded-full" title="Analyse non concluante ou non requise">
                                                    <AlertCircle className="w-5 h-5" />
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </Card>
    );
}
