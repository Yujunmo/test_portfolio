-- 펀드 기본 정보 조회
-- base_year_month 기준 마지막 영업일을 base_date로 함께 반환한다.
SELECT
    fn.fund_code,
    fn.fund_name,
    fn.company_code,
    fi.manager_name,
    fi.inception_date,
    fi.fund_type,
    fi.bm_name,
    -- 해당 연월의 마지막 영업일
    (
        SELECT MAX(date) FROM fund_nav
        WHERE fund_code = :fund_code
          AND date <= date(:base_year_month || '-01', '+1 month', '-1 day')
    ) AS base_date,
    -- 설정일 기준 NAV (첫 영업일)
    (
        SELECT adj_nav FROM fund_nav
        WHERE fund_code = :fund_code
        ORDER BY date ASC LIMIT 1
    ) AS inception_nav,
    -- 기준일 NAV
    (
        SELECT adj_nav FROM fund_nav
        WHERE fund_code = :fund_code
          AND date = (
              SELECT MAX(date) FROM fund_nav
              WHERE fund_code = :fund_code
                AND date <= date(:base_year_month || '-01', '+1 month', '-1 day')
          )
    ) AS base_nav,
    -- 순자산 (기준일)
    (
        SELECT net_assets FROM fund_nav
        WHERE fund_code = :fund_code
          AND date = (
              SELECT MAX(date) FROM fund_nav
              WHERE fund_code = :fund_code
                AND date <= date(:base_year_month || '-01', '+1 month', '-1 day')
          )
    ) AS net_assets

FROM (SELECT DISTINCT fund_code, fund_name, company_code FROM fund_nav WHERE fund_code = :fund_code) fn
JOIN fund_info fi ON fn.fund_code = fi.fund_code
