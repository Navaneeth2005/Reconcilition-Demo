const Joi = require('joi');

// Schema for CSV record validation
const csvRecordSchema = Joi.object({
  employee_id: Joi.string().required(),
  plan_code: Joi.string().required(),
  coverage_level: Joi.string().required(),
  premium: Joi.number().positive().required()
});

/**
 * Validate that CSV has required headers
 * @param {Array} records - Array of parsed CSV records
 * @throws {Error} If headers are missing or invalid
 */
function validateCSVHeaders(records) {
  if (!records || records.length === 0) {
    throw new Error('CSV file is empty or invalid');
  }
  
  const requiredHeaders = ['employee_id', 'plan_code', 'coverage_level', 'premium'];
  const actualHeaders = Object.keys(records[0]);
  
  const missingHeaders = requiredHeaders.filter(h => !actualHeaders.includes(h));
  
  if (missingHeaders.length > 0) {
    throw new Error(`Missing required headers: ${missingHeaders.join(', ')}`);
  }
  
  return true;
}

module.exports = { validateCSVHeaders, csvRecordSchema };
