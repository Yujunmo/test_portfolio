SELECT fund_overview, holdings, performance, manager_comment, market_analysis
FROM report_content
WHERE fund_code       = :fund_code
  AND base_year_month = :base_year_month
