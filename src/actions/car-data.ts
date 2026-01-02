'use server';

import { base, TABLE_NAME } from '@/lib/airtable';

// Define the shape of our data
export interface CarData {
    mileage: number;
    history: Record<string, number>;
}

export async function fetchCarData(): Promise<CarData | null> {
    console.log("Server Action: Fetching car data...");
    if (!base) {
        console.warn("Server Action Warning: Base not initialized.");
        return null;
    }

    try {
        const records = await base(TABLE_NAME).select({ maxRecords: 1 }).firstPage();
        console.log(`Server Action: Fetched ${records.length} records.`);

        if (records.length === 0) return null;

        const record = records[0];
        const mileage = record.get('Mileage') as number;
        const historyString = record.get('History') as string;

        console.log("Server Action: Raw fetched data:", { mileage, historyString });

        let history = {};
        try {
            if (historyString) history = JSON.parse(historyString);
        } catch (e) {
            console.error("Server Action: JSON parse error for history", e);
        }

        return { mileage, history };
    } catch (error) {
        console.error("Server Action: Airtable fetch error:", error);
        return null;
    }
}

export async function saveCarData(mileage: number, history: Record<string, number>): Promise<boolean> {
    console.log("Server Action: Attempting to save car data...");

    if (!base) {
        console.error("Server Action Error: Airtable base is not initialized. Check API KEY and BASE ID.");
        return false;
    }

    try {
        console.log(`Server Action: Querying table '${TABLE_NAME}'...`);
        const records = await base(TABLE_NAME).select({ maxRecords: 1 }).firstPage();
        console.log(`Server Action: Found ${records.length} records.`);

        const fields = {
            'Mileage': mileage,
            'History': JSON.stringify(history)
        };

        console.log("Server Action: Data to save:", fields);

        if (records.length === 0) {
            console.log("Server Action: Creating new record...");
            await base(TABLE_NAME).create([
                { fields }
            ]);
        } else {
            console.log(`Server Action: Updating record ${records[0].id}...`);
            await base(TABLE_NAME).update(records[0].id, fields);
        }
        console.log("Server Action: Save successful!");
        return true;
    } catch (error) {
        console.error("Server Action: Airtable API Error:", error);
        return false;
    }
}
