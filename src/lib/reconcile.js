/**
 * Build a Map keyed by employee_id for fast lookup
 * @param {Array} records - Array of employee records
 * @returns {Map} Map with employee_id as key
 */
function buildEmployeeMap(records) {
  const map = new Map();
  
  for (const record of records) {
    map.set(record.employee_id, record);
  }
  
  return map;
}

/**
 * Reconcile enrollment records against invoice records
 * @param {Array} enrollmentRecords - Enrollment data
 * @param {Array} invoiceRecords - Invoice data
 * @param {number} toleranceDollars - Acceptable premium difference (default 1)
 * @returns {Array} Array of discrepancies
 */
function reconcile(enrollmentRecords, invoiceRecords, toleranceDollars = 1) {
  const discrepancies = [];
  
  // Build maps for fast O(1) lookup
  const enrollmentMap = buildEmployeeMap(enrollmentRecords);
  const invoiceMap = buildEmployeeMap(invoiceRecords);
  
  console.log(`Reconciling ${enrollmentMap.size} enrolled vs ${invoiceMap.size} billed`);
  
  // STEP A: Check all enrolled employees
  for (const [employeeId, enrollmentData] of enrollmentMap) {
    const invoiceData = invoiceMap.get(employeeId);
    
    // Case 1: Enrolled but NOT billed
    if (!invoiceData) {
      discrepancies.push({
        employee_id: employeeId,
        reason: 'MISSING_INVOICE',
        details: 'Employee enrolled but not found in invoice',
        severity: 'HIGH'
      });
      continue;
    }
    
    // Case 2: Field mismatches
    // Check plan code
    if (enrollmentData.plan_code !== invoiceData.plan_code) {
      discrepancies.push({
        employee_id: employeeId,
        field: 'plan_code',
        expected: enrollmentData.plan_code,
        actual: invoiceData.plan_code,
        reason: 'PLAN_MISMATCH',
        severity: 'MEDIUM'
      });
    }
    
    // Check coverage level
    if (enrollmentData.coverage_level !== invoiceData.coverage_level) {
      discrepancies.push({
        employee_id: employeeId,
        field: 'coverage_level',
        expected: enrollmentData.coverage_level,
        actual: invoiceData.coverage_level,
        reason: 'COVERAGE_MISMATCH',
        severity: 'MEDIUM'
      });
    }
    
    // Check premium (with tolerance)
    const expectedPremium = parseFloat(enrollmentData.premium);
    const actualPremium = parseFloat(invoiceData.premium);
    const difference = Math.abs(expectedPremium - actualPremium);
    
    if (difference > toleranceDollars) {
      discrepancies.push({
        employee_id: employeeId,
        field: 'premium',
        expected: expectedPremium,
        actual: actualPremium,
        difference: parseFloat(difference.toFixed(2)),
        reason: 'PREMIUM_MISMATCH',
        severity: difference > 50 ? 'HIGH' : 'LOW'
      });
    }
  }
  
  // STEP B: Check for employees billed but NOT enrolled
  for (const [employeeId, invoiceData] of invoiceMap) {
    const enrollmentData = enrollmentMap.get(employeeId);
    
    if (!enrollmentData) {
      discrepancies.push({
        employee_id: employeeId,
        reason: 'MISSING_ENROLLMENT',
        details: 'Employee billed but not found in enrollment (possible terminated employee)',
        premium_charged: parseFloat(invoiceData.premium),
        severity: 'CRITICAL'
      });
    }
  }
  
  console.log(`Found ${discrepancies.length} discrepancies`);
  return discrepancies;
}

module.exports = { reconcile, buildEmployeeMap };
