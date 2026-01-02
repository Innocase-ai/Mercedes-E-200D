'use server';

import { base, TABLE_NAME } from '@/lib/airtable';

// Define the shape of our data
export interface CarData {
    mileage: number;
    history: Record<string, number>;
}

export async function fetchCarData(): Promise<CarData | null> {
    if (!base) return null;

    try {
        const records = await base(TABLE_NAME).select({ maxRecords: 1 }).firstPage();
        if (records.length === 0) return null;

        const record = records[0];
        const mileage = record.get('Mileage') as number;
        const historyString = record.get('History') as string;

        let history = {};
        try {
            if (historyString) history = JSON.parse(historyString);
        } catch {
            // ignore parse error
        }

        return { mileage, history };
    } catch (error) {
        console.error("Airtable fetch error:", error);
        return null;
    }
}

export async function saveCarData(mileage: number, history: Record<string, number>): Promise<boolean> {
    if (!base) return false;

    try {
        const records = await base(TABLE_NAME).select({ maxRecords: 1 }).firstPage();

        const fields = {
            'Mileage': mileage,
            'History': JSON.stringify(history)
        };

        if (records.length === 0) {
            await base(TABLE_NAME).create([
                { fields }
            ]);
        } else {
            await base(TABLE_NAME).update(records[0].id, fields);
        }
        return true;
    } catch (error) {
        console.error("Airtable save error:", error);
        return false;
    }
}
