// import-data-to-supabase.js
// This script imports the exported JSON data to your new Supabase instance
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration - NEW Supabase instance
// Prefer environment variables for security. Fallbacks keep the script runnable.
const SUPABASE_URL = process.env.SUPABASE_URL || "https://yiquudnrheitmcnwowlh.supabase.co";
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlpcXV1ZG5yaGVpdG1jbndvd2xoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUyNjI0NzMsImV4cCI6MjA3MDgzODQ3M30.8UzLhEbeaB6iV7EaCQmR0tW5WzLM11zIfRZ9_nFeNEQ"; // Prefer SERVICE ROLE

// Create Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// List of tables to import in FK-safe order
const tables = [
  'patients',
  'medications',
  'queue_types',
  'service_points',
  'appointments',
  'patient_medications',
  'queues',
  'pharmacy_queue_services',
  'line_settings',
  'profiles'
];

// Conflict target per table (falls back to primary key 'id')
const conflictTargets = {
  queue_types: 'code'
};

// Function to import data for a table
async function importTableData(tableName) {
  try {
    console.log(`\n[${tableName}] Using URL: ${SUPABASE_URL}`);
    const filePath = path.join(__dirname, `${tableName}_data.json`);
    
    // Check if the file exists
    if (!fs.existsSync(filePath)) {
      console.log(`No data file found for table ${tableName}, skipping...`);
      return;
    }
    
    // Read the data file
    const dataString = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(dataString);
    
    if (!data || data.length === 0) {
      console.log(`No data found in file for table ${tableName}, skipping...`);
      return;
    }
    
    console.log(`Importing ${data.length} records to table ${tableName}...`);
    
    // Upsert data in batches (avoids duplicate key errors)
    const batchSize = 50;
    for (let i = 0; i < data.length; i += batchSize) {
      const batch = data.slice(i, i + batchSize);
      const { error } = await supabase
        .from(tableName)
        .upsert(batch, {
          onConflict: conflictTargets[tableName] || 'id',
          ignoreDuplicates: true
        });
      
      if (error) {
        console.error(`Error importing batch ${Math.floor(i/batchSize) + 1} to ${tableName}:`, error);
      } else {
        console.log(`Successfully imported batch ${Math.floor(i/batchSize) + 1} of ${Math.ceil(data.length/batchSize)} to ${tableName}`);
      }
    }
    
    console.log(`Completed import for table ${tableName}`);
  } catch (error) {
    console.error(`Error importing data for table ${tableName}:`, error);
  }
}

// Main function
async function main() {
  console.log("Starting data import process...");
  
  // Import data for each table
  for (const table of tables) {
    await importTableData(table);
  }
  
  console.log("Data import process completed!");
}

// Run the import
main();
