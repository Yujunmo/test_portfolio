SELECT
    fund_code,
    fund_name,
    date,
    adj_nav,
    net_assets,
    bm_code
FROM fund_nav
WHERE fund_code IN :fund_codes
  AND date >= :start_date
  AND date <= :end_date
ORDER BY fund_code, date
