const path = require('path');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') });
const Airtable = require('airtable');

const baseId = process.env.AIRTABLE_BASE_ID;
const apiKey = process.env.AIRTABLE_API_KEY;

const base = new Airtable({ apiKey }).base(baseId);
const tableName = 'HistoriqueEntretiens';

async function test() {
    try {
        console.log(`\nAttempting to select from table '${tableName}'...`);
        const records = await base(tableName).select({ maxRecords: 1 }).firstPage();
        console.log('✅ Connection successful!');

        if (records.length > 0) {
            console.log('First record fields:', JSON.stringify(records[0].fields, null, 2));
        } else {
            console.log('Table is empty. Creating a dummy record to verify fields...');
            try {
                const created = await base(tableName).create([
                    {
                        fields: {
                            'TacheID': 'test_task',
                            'Kilometrage Realise': 1000,
                            // 'Date': new Date().toISOString() // Try with and without date if it fails, but assuming string or date field
                        }
                    }
                ]);
                console.log('✅ Created test record:', created[0].id);
                console.log('Fields:', JSON.stringify(created[0].fields, null, 2));

                // Cleanup
                await base(tableName).destroy([created[0].id]);
                console.log('✅ Cleaned up test record.');
            } catch (e) {
                console.error('❌ Creation failed:', e.message);
            }
        }
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

test();
