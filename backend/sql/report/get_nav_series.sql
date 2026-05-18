-- 누적수익률 시계열 (설정일 기준 기간수익률)
-- base_date까지의 NAV 전체를 반환하며 기준가(설정일 NAV)는 Python에서 정규화한다.
SELECT
    date,
    adj_nav
FROM fund_nav
WHERE fund_code = :fund_code
  AND date >= :inception_date
  AND date <= :base_date
ORDER BY date
