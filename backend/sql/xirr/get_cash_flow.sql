SELECT
    fund_code,
    fund_name,
    date,
    cash_flow
FROM fund_cash_flow
WHERE fund_code IN :fund_codes
  AND date >= :start_date
  AND date <= :end_date
ORDER BY fund_code, date
