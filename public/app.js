const enrollmentInput = document.getElementById('enrollment');
const invoiceInput = document.getElementById('invoice');
const enrollmentLabel = document.getElementById('enrollmentLabel');
const invoiceLabel = document.getElementById('invoiceLabel');
const resultDiv = document.getElementById('result');
const reconcileBtn = document.getElementById('reconcileBtn');

// Highlight uploaded files
enrollmentInput.addEventListener('change', () => enrollmentLabel.classList.add('uploaded'));
invoiceInput.addEventListener('change', () => invoiceLabel.classList.add('uploaded'));

reconcileBtn.addEventListener('click', async () => {
  if (!enrollmentInput.files.length || !invoiceInput.files.length) {
    alert('Please upload both files.');
    return;
  }

  const formData = new FormData();
  formData.append('enrollment', enrollmentInput.files[0]);
  formData.append('invoice', invoiceInput.files[0]);

  // Keep previous output until new response arrives
  const previousOutput = resultDiv.innerHTML;
  resultDiv.innerHTML = "<p class='loading'>Processing... please wait ⏳</p>";

  try {
    const response = await fetch('http://localhost:3000/api/reconcile', {
      method: 'POST',
      body: formData
    });

    const data = await response.json();

    if (!response.ok) throw new Error(data.message || 'Reconciliation failed');

    resultDiv.innerHTML = `
      <h2>✅ Reconciliation Complete</h2>
      <div class="summary">
        <p><strong>Total Enrolled:</strong> ${data.summary.total_enrolled}</p>
        <p><strong>Total Billed:</strong> ${data.summary.total_billed}</p>
        <p><strong>Discrepancies Found:</strong> ${data.summary.discrepancies_found}</p>
      </div>
      <h3>Discrepancies:</h3>
      <pre>${JSON.stringify(data.discrepancies, null, 2)}</pre>
    `;
  } catch (err) {
    resultDiv.innerHTML = `<p class="error">❌ ${err.message}</p>`;
  }
});
