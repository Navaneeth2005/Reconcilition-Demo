const csv = require('csv-parse');
const fs = require('fs');

/**
 * Parse CSV file into array of objects
 * @param {string} filePath - Path to CSV file
 * @returns {Promise<Array>} Array of parsed records
 */
async function parseCSV(filePath) {
  return new Promise((resolve, reject) => {
    const results = [];
    
    fs.createReadStream(filePath)
      .pipe(csv.parse({ 
        columns: true,      // Use first row as headers
        trim: true,         // Trim whitespace
        skip_empty_lines: true
      }))
      .on('data', (row) => {
        results.push(row);
      })
      .on('end', () => {
        console.log(`Parsed ${results.length} records from ${filePath}`);
        resolve(results);
      })
      .on('error', (error) => {
        console.error(`Error parsing CSV: ${error.message}`);
        reject(error);
      });
  });
}

module.exports = { parseCSV };
