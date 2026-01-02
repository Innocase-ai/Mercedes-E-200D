const fs = require('fs');
require('dotenv').config({ path: '.env.local' });
const Airtable = require('airtable');

const baseId = process.env.AIRTABLE_BASE_ID;
const apiKey = process.env.AIRTABLE_API_KEY;

if (!baseId || !apiKey) {
    console.error("❌ Missing env variables");
    process.exit(1);
}

const base = new Airtable({ apiKey }).base(baseId);

async function debugAll() {
    const tables = {
        'Vehicules': 'Vehicules',
        'TachesMaintenance': 'TachesMaintenance',
        'HistoriqueEntretiens': 'HistoriqueEntretiens',
        'Factures': 'Factures'
    };

    for (const [key, name] of Object.entries(tables)) {
        console.log(`\n--- Table: ${name} ---`);
        try {
            const records = await base(name).select().all();
            console.log(`✅ Success: Found ${records.length} records`);
            if (records.length > 0) {
                console.log("Sample Fields:", Object.keys(records[0].fields));
                console.log("Sample Data:", records[0].fields);
            }
        } catch (e) {
            console.error(`❌ Error in ${name}:`, e.message);
        }
    }
}

debugAll();
