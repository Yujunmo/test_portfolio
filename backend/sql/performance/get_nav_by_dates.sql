SELECT
    fund_code,
    fund_name,
    date,
    adj_nav
FROM fund_nav
WHERE fund_code IN :fund_codes
  AND date IN :dates
ORDER BY fund_code, date
