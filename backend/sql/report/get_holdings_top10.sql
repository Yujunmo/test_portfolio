-- 기준일 TOP10 보유 종목 (편입비중, 수익률, 기여도 포함)
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
    t.stock_code,
    t.stock_name,
    t.sector,
    t.holding_qty,
    t.avg_buy_price,
    t.close_price                                                     AS current_price,
    t.holding_qty * t.close_price                                     AS eval_amount,
    -- 편입비중(%)
    ROUND(
        CAST(t.holding_qty * t.close_price AS REAL) / total.total_eval * 100
    , 2)                                                              AS weight_pct,
    -- 종목 수익률(%)
    ROUND(
        (CAST(t.close_price AS REAL) / t.avg_buy_price - 1) * 100
    , 2)                                                              AS stock_return_pct,
    -- 수익률 기여도(%) = 종목수익률 × 편입비중
    ROUND(
        (CAST(t.close_price AS REAL) / t.avg_buy_price - 1)
        * CAST(t.holding_qty * t.close_price AS REAL) / total.total_eval * 100
    , 2)                                                              AS contribution_pct

FROM tru_stck_ma t, params p, total
WHERE t.company_code = p.p_company
  AND t.fund_code    = p.p_fund
  AND t.date         = p.p_date
ORDER BY eval_amount DESC
LIMIT 10
