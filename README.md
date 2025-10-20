<<<<<<< HEAD

=======
-Overview 
>>>>>>> 107033b (Update server and frontend setup)

A Node.js/Express service that reconciles employee enrollment data against carrier invoices to detect billing discrepancies.

Companies often get overcharged for benefits because:
<<<<<<< HEAD
- Terminated employees still appear on invoices
- Premium amounts don't match enrollment data
- Plan codes or coverage levels are incorrect

This service automates the reconciliation process
- CSV file upload and parsing
- Enrollment vs invoice comparison
- Configurable premium tolerance
- Detailed discrepancy reporting with severity levels
- RESTful API design



=======
-> Terminated employees still appear on invoices
-> Premium amounts don't match enrollment data
-> Plan codes or coverage levels are incorrect

This service automates the reconciliation process
-> CSV file upload and parsing
-> Enrollment vs invoice comparison
-> Configurable premium tolerance
-> Detailed discrepancy reporting with severity levels
-> RESTful API design


-> CSV Parsing Approach

For parsing CSV files, I used the csv-parse library, which efficiently handles data through Node.js streams. This streaming-based approach allows the parser to process the file line by line instead of loading the entire CSV into memory, making it highly suitable for large datasets. The parser is configured with columns: true to automatically use the first row as headers, trim: true to remove extra spaces, and skip_empty_lines: true to ignore blank rows.

After parsing, each row is represented as a clean JavaScript object with keys corresponding to the CSV headers. I then validate the presence of required headers (employee_id, plan_code, coverage_level, premium) using a custom function, and ensure correct data types and values with a Joi schema, enforcing that premium is a positive number.

Overall, the pipeline transforms raw CSV data into validated, structured JavaScript objects through a memory-efficient, stream-based process that maintains data integrity and scalability.



-> Reconciliation Algorithm

The reconciliation logic is implemented in the reconcile() function, which compares two datasets — enrollment records and invoice records — to identify discrepancies between what is billed and what is actually enrolled.


I. Matching Key Fields

Records are matched based on a unique combination of identifying fields:

employee_id — uniquely identifies each employee.

plan_code — represents the benefit plan type.

coverage_level — defines the coverage category (e.g., SINGLE, FAMILY, EMPLOYEE_SPOUSE).

Together, these three fields form a composite key for precise record matching between the two CSV files.


II. Comparison Strategy

The algorithm uses a deterministic (exact match) approach rather than fuzzy matching.
For every record in the enrollment dataset, the program:

Searches for a corresponding record in the invoice dataset with the same composite key (employee_id + plan_code + coverage_level).

Compares the premium values between the two matched records.

A tolerance value (default: $1.00) can be passed via query parameters to account for small billing variations.
If the premium difference exceeds this tolerance, the record is flagged as a discrepancy.


III. Handling One-to-Many Relationships

If multiple records share the same key in either dataset:

The algorithm aggregates duplicates by summing their premiums before comparison.

This ensures fair reconciliation even when an employee or plan appears multiple times across files.


IV. Scoring / Matching Logic

The system uses simple boolean matching — records either match exactly (within tolerance) or are marked as discrepancies.
No scoring or fuzzy matching algorithm (like Levenshtein or similarity metrics) is used, ensuring transparency and deterministic results for financial audits.


->Edge Cases Handled

The reconciliation system is built to handle real-world data inconsistencies gracefully:

Missing or Null Fields: Validated using a Joi schema; incomplete rows are rejected before processing.

Duplicate Records: Entries with the same employee_id, plan_code, and coverage_level are aggregated by summing premiums.

Case & Whitespace Variations: All text fields are normalized to lowercase and trimmed.

Different Column Orders: Handled automatically through header-based mapping (columns: true).

Records in One File Only: Flagged as discrepancies in the final report.

Date Inconsistencies (if present): Can be normalized to a consistent YYYY-MM-DD format during parsing.

This ensures accurate, consistent reconciliation even when source CSVs are imperfect.
>>>>>>> 107033b (Update server and frontend setup)
