const express = require('express');
const multer = require('multer');
const fs = require('fs').promises;

const path = require('path');
const { parseCSV } = require('../lib/csv');
const { reconcile } = require('../lib/reconcile');
const { validateCSVHeaders } = require('../lib/validation');

const router = express.Router();

// Configure multer for file uploads
const upload = multer({ 
  dest: 'uploads/',
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});


router.post('/reconcile', upload.fields([
  { name: 'enrollment', maxCount: 1 },
  { name: 'invoice', maxCount: 1 }
]),async (req, res) => {
  let enrollmentFile, invoiceFile;
  try {
    if (!req.files || !req.files['enrollment'] || !req.files['invoice']) {
      return res.status(400).json({ 
        error: 'Missing files', 
        message: 'Please upload both enrollment and invoice CSV files' 
      });
    }

    enrollmentFile = req.files['enrollment'][0];
    invoiceFile = req.files['invoice'][0];

    console.log('Processing reconciliation...');
    console.log('Enrollment file:', enrollmentFile.originalname);
    console.log('Invoice file:', invoiceFile.originalname);

    // Parse CSV files
    const enrollmentRecords = await parseCSV(enrollmentFile.path);
    const invoiceRecords = await parseCSV(invoiceFile.path);

    // Validate CSV headers
    validateCSVHeaders(enrollmentRecords);
    validateCSVHeaders(invoiceRecords);

    // Get tolerance from query params (default 1 dollar)
    const tolerance = parseFloat(req.query.tolerance) || 1;

    // Run reconciliation
    const discrepancies = reconcile(enrollmentRecords, invoiceRecords, tolerance);

    // Cleanup uploaded files
    await fs.unlink(enrollmentFile.path);
    await fs.unlink(invoiceFile.path);

    // Return results
    res.json({
      status: 'success',
      summary: {
        total_enrolled: enrollmentRecords.length,
        total_billed: invoiceRecords.length,
        discrepancies_found: discrepancies.length,
        tolerance_dollars: tolerance
      },
      discrepancies: discrepancies,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Reconciliation error:', error);
    
    // Cleanup files on error
    if (enrollmentFile) {
      try { await fs.unlink(enrollmentFile.path); } catch (e) {}
    }
    if (invoiceFile) {
      try { await fs.unlink(invoiceFile.path); } catch (e) {}
    }

    res.status(400).json({ 
      error: 'Reconciliation failed', 
      message: error.message 
    });
  }
});

module.exports = router;
