-- 각 펀드별 기간 수익률을 SQL에서 직접 계산한다.
-- 거래일 기준 가장 가까운 날짜(target_date 이상 첫 영업일)의 NAV를 이용한다.
SELECT
    fl.fund_code,
    fl.fund_name,

    -- 조회기간: start_date 이상 첫 영업일 → end_date 이상 첫 영업일
    :start_date AS period_start_date,
    :end_date   AS period_end_date,
    ROUND(
        (
            (SELECT adj_nav FROM fund_nav WHERE fund_code = fl.fund_code AND date >= :end_date   ORDER BY date LIMIT 1)
          / (SELECT adj_nav FROM fund_nav WHERE fund_code = fl.fund_code AND date >= :start_date ORDER BY date LIMIT 1)
          - 1
        ) * 100, 1
    ) AS return_period,

    -- 1일
    date(:end_date, '-1 day') AS date_1d,
    ROUND(
        (
            (SELECT adj_nav FROM fund_nav WHERE fund_code = fl.fund_code AND date >= :end_date               ORDER BY date LIMIT 1)
          / (SELECT adj_nav FROM fund_nav WHERE fund_code = fl.fund_code AND date >= date(:end_date, '-1 day') ORDER BY date LIMIT 1)
          - 1
        ) * 100, 1
    ) AS return_1d,

    -- 1주
    date(:end_date, '-7 days') AS date_1w,
    ROUND(
        (
            (SELECT adj_nav FROM fund_nav WHERE fund_code = fl.fund_code AND date >= :end_date                ORDER BY date LIMIT 1)
          / (SELECT adj_nav FROM fund_nav WHERE fund_code = fl.fund_code AND date >= date(:end_date, '-7 days') ORDER BY date LIMIT 1)
          - 1
        ) * 100, 1
    ) AS return_1w,

    -- 1개월
    date(:end_date, '-1 month') AS date_1m,
    ROUND(
        (
            (SELECT adj_nav FROM fund_nav WHERE fund_code = fl.fund_code AND date >= :end_date                 ORDER BY date LIMIT 1)
          / (SELECT adj_nav FROM fund_nav WHERE fund_code = fl.fund_code AND date >= date(:end_date, '-1 month') ORDER BY date LIMIT 1)
          - 1
        ) * 100, 1
    ) AS return_1m,

    -- 3개월
    date(:end_date, '-3 months') AS date_3m,
    ROUND(
        (
            (SELECT adj_nav FROM fund_nav WHERE fund_code = fl.fund_code AND date >= :end_date                  ORDER BY date LIMIT 1)
          / (SELECT adj_nav FROM fund_nav WHERE fund_code = fl.fund_code AND date >= date(:end_date, '-3 months') ORDER BY date LIMIT 1)
          - 1
        ) * 100, 1
    ) AS return_3m,

    -- 6개월
    date(:end_date, '-6 months') AS date_6m,
    ROUND(
        (
            (SELECT adj_nav FROM fund_nav WHERE fund_code = fl.fund_code AND date >= :end_date                  ORDER BY date LIMIT 1)
          / (SELECT adj_nav FROM fund_nav WHERE fund_code = fl.fund_code AND date >= date(:end_date, '-6 months') ORDER BY date LIMIT 1)
          - 1
        ) * 100, 1
    ) AS return_6m,

    -- 1년
    date(:end_date, '-1 year') AS date_1y,
    ROUND(
        (
            (SELECT adj_nav FROM fund_nav WHERE fund_code = fl.fund_code AND date >= :end_date                ORDER BY date LIMIT 1)
          / (SELECT adj_nav FROM fund_nav WHERE fund_code = fl.fund_code AND date >= date(:end_date, '-1 year') ORDER BY date LIMIT 1)
          - 1
        ) * 100, 1
    ) AS return_1y

FROM (
    SELECT DISTINCT fund_code, fund_name
    FROM fund_nav
    WHERE fund_code IN :fund_codes
) fl
ORDER BY fl.fund_code
