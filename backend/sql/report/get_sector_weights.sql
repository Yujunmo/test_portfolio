-- 업종별 편입비중 (기준일 기준)
WITH params AS (
    SELECT :company_code AS p_company, :fund_code AS p_fund, :base_date AS p_date
),
total AS (
    SELECT SUM(t.holding_qty * t.close_price) AS total_eval
    FROM tru_stck_ma t, params p
    WHERE t.company_code = p.p_company
      AND t.fund_code    = p.p_fund
      AND t.date         = p.p_date
)
SELECT
    t.sector,
    SUM(t.holding_qty * t.close_price)                                AS eval_amount,
    ROUND(
        CAST(SUM(t.holding_qty * t.close_price) AS REAL) / total.total_eval * 100
    , 2)                                                              AS weight_pct
FROM tru_stck_ma t, params p, total
WHERE t.company_code = p.p_company
  AND t.fund_code    = p.p_fund
  AND t.date         = p.p_date
GROUP BY t.sector
ORDER BY eval_amount DESC
