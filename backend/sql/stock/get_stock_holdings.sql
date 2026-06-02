-- 펀드 주식 보유현황 일별 조회
-- params CTE로 파라미터를 한 번만 바인딩하고, 이후 모든 절에서 참조한다.
-- p_stock_code 가 빈 문자열('')이면 종목 필터를 적용하지 않는다.
WITH params AS (
    SELECT
        :company_code AS p_company,
        :fund_code    AS p_fund,
        :base_date    AS p_date,
        :stock_code   AS p_stock
),
prev_close AS (
    -- 기준일자 직전 영업일의 종가
    SELECT
        t.fund_code,
        t.stock_code,
        t.close_price AS prev_close_price
    FROM tru_stck_ma t, params p
    WHERE t.company_code = p.p_company
      AND t.fund_code    = p.p_fund
      AND t.date = (
          SELECT MAX(t2.date)
          FROM tru_stck_ma t2, params p2
          WHERE t2.company_code = p2.p_company
            AND t2.fund_code    = p2.p_fund
            AND t2.date         < p2.p_date
      )
)
SELECT
    t.fund_code,
    t.fund_name,
    t.stock_code,
    t.stock_name,
    t.date,

    -- 보유수량
    t.holding_qty,

    -- 평균매입단가
    t.avg_buy_price,

    -- 현재가(당일 종가)
    t.close_price                                                              AS current_price,

    -- 평가금액 = 보유수량 × 현재가
    t.holding_qty * t.close_price                                              AS eval_amount,

    -- 매입금액 = 보유수량 × 평균매입단가
    t.holding_qty * t.avg_buy_price                                            AS buy_amount,

    -- 평가손익 = 평가금액 − 매입금액
    (t.holding_qty * t.close_price) - (t.holding_qty * t.avg_buy_price)       AS eval_profit,

    -- 수익률(%) = 평가손익 / 매입금액 × 100
    ROUND(
        CAST((t.holding_qty * t.close_price) - (t.holding_qty * t.avg_buy_price) AS REAL)
        / (t.holding_qty * t.avg_buy_price) * 100
    , 5)                                                                       AS return_pct,

    -- 전일대비 = 현재가 − 전일 종가
    t.close_price - pc.prev_close_price                                        AS vs_prev_day,

    -- 전일대비율(%) = 전일대비 / 전일 종가 × 100
    ROUND(
        CAST(t.close_price - pc.prev_close_price AS REAL)
        / pc.prev_close_price * 100
    , 2)                                                                       AS vs_prev_day_pct

FROM tru_stck_ma t
CROSS JOIN params p
LEFT JOIN prev_close pc
       ON t.fund_code  = pc.fund_code
      AND t.stock_code = pc.stock_code

WHERE t.company_code = p.p_company
  AND t.fund_code    = p.p_fund
  AND t.date         = p.p_date
  AND (p.p_stock = '' OR t.stock_code = p.p_stock)

ORDER BY t.stock_code
