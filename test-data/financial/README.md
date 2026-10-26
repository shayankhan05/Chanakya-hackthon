# Fictional financial import fixtures

`fictional-six-month-bank-statement.csv` is entirely fictional: April–September 2026, 36 transactions, no real account information. The same file is downloadable from Financial Records. Regenerate both copies with `npx tsx scripts/financial-samples.mts`.

Use a separate signed-in test account for upload and persistence tests. The anonymous `/demo` only keeps its built-in fictional fixture for the current page session.

Account label: `Fictional operating`. Statement dates: `2026-04-01` to `2026-09-30`. Explicitly consent, extract, review all categories, change ambiguous A to Owner investment and B to Owner withdrawal, confirm full-period coverage and the review declaration, then Confirm reviewed summary.

Expected monthly customer receipts: INR 350,000.00; operating payments: INR 185,000.00; operating surplus: INR 165,000.00. Six-month reviewed receipts: INR 2,100,000.00. On the October 2026 demo clock, annual sales proxy: INR 4,200,000.00. These are not accounting profit or confirmed statutory turnover. Live dates use the server's actual India date, so missing newer months may withhold future forecasts.
