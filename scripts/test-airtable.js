require('dotenv').config({ path: '.env.local' });
const Airtable = require('airtable');

const apiKey = process.env.AIRTABLE_API_KEY;
const baseId = process.env.AIRTABLE_BASE_ID;

console.log('--- AIRTABLE DIAGNOSTIC ---');
console.log('API Key present:', !!apiKey);
console.log('Base ID present:', !!baseId);

if (!apiKey || !baseId) {
    console.error('CRITICAL: Missing credentials in .env.local');
    process.exit(1);
}

const base = new Airtable({ apiKey }).base(baseId);
const tableName = 'CarStatus';

async function check() {
    console.log(`\nAttempting to connect to table: "${tableName}"...`);
    try {
        const records = await base(tableName).select({ maxRecords: 1 }).firstPage();
        console.log('✅ Connection Successful!');
        console.log(`Found ${records.length} records.`);

        if (records.length > 0) {
            console.log('Sample record fields:', Object.keys(records[0].fields));
        } else {
            console.log('Table is empty. Attempting to create a test record to verify fields...');
            try {
                await base(tableName).create([
                    {
                        fields: {
                            'Mileage': 123456,
                            'History': '{}'
                        }
                    }
                ]);
                console.log('✅ Write Successful! Fields "Mileage" and "History" are correct.');
            } catch (writeError) {
                console.error('❌ Write Failed. This usually means Field Names are wrong.');
                console.error('Error details:', writeError.message);
            }
        }
    } catch (err) {
        if (err.statusCode === 404) {
            console.error('❌ Table NOT FOUND. Please check the table name is exactly ' + tableName);
        } else if (err.statusCode === 401) {
            console.error('❌ Unauthorized. Your API Key seems invalid.');
        } else {
            console.error('❌ Error:', err.message);
        }
    }
}

check();
