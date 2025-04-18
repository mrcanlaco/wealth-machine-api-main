-- Create RPC functions for reporting
CREATE OR REPLACE FUNCTION get_machine_overview(
    p_machine_id UUID,
    p_page_size INT DEFAULT 10,
    p_page INT DEFAULT 1
)
RETURNS TABLE (
    total_balance DECIMAL,
    wallet_summary JSONB,
    fund_summary JSONB,
    recent_transactions JSONB,
    total_transactions BIGINT
) AS $$
BEGIN
    RETURN QUERY
    WITH wallet_data AS (
        SELECT 
            COALESCE(SUM(balance), 0) as total_wallet_balance,
            jsonb_agg(
                jsonb_build_object(
                    'id', id,
                    'name', name,
                    'type', type,
                    'balance', balance,
                    'currency', currency
                )
            ) as wallets
        FROM wallets
        WHERE machine_id = p_machine_id
    ),
    fund_data AS (
        SELECT 
            jsonb_agg(
                jsonb_build_object(
                    'id', f.id,
                    'name', f.name,
                    'balance', f.balance,
                    'percent', f.percent,
                    'store', jsonb_build_object(
                        'id', s.id,
                        'name', s.name,
                        'type', s.type
                    )
                )
            ) as funds
        FROM funds f
        JOIN stores s ON s.id = f.store_id
        WHERE f.machine_id = p_machine_id
    ),
    transaction_data AS (
        SELECT 
            COUNT(*) OVER() as total_count,
            jsonb_agg(
                jsonb_build_object(
                    'id', id,
                    'type', type,
                    'amount', amount,
                    'currency', currency,
                    'note', note,
                    'created_at', created_at,
                    'status', status
                )
                ORDER BY created_at DESC
            ) as transactions
        FROM transactions
        WHERE machine_id = p_machine_id
          AND status = 'completed'
        LIMIT p_page_size
        OFFSET (p_page - 1) * p_page_size
    )
    SELECT 
        wd.total_wallet_balance,
        wd.wallets,
        fd.funds,
        td.transactions,
        COALESCE(td.total_count, 0)
    FROM wallet_data wd
    CROSS JOIN fund_data fd
    CROSS JOIN transaction_data td;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create RPC function for cash flow report
CREATE OR REPLACE FUNCTION get_cash_flow_report(
    p_machine_id UUID,
    p_start_date TIMESTAMPTZ,
    p_end_date TIMESTAMPTZ,
    p_currency TEXT DEFAULT 'VND',
    p_period_type TEXT DEFAULT 'month' -- 'month', 'quarter', 'year'
) RETURNS TABLE (
    period TEXT,
    income DECIMAL,
    expense DECIMAL,
    lending DECIMAL,
    borrowing DECIMAL,
    net_flow DECIMAL,
    transactions JSONB
) AS $$
BEGIN
    RETURN QUERY
    WITH monthly_transactions AS (
        SELECT
            CASE p_period_type
                WHEN 'month' THEN to_char(date_trunc('month', created_at), 'YYYY-MM')
                WHEN 'quarter' THEN to_char(date_trunc('quarter', created_at), 'YYYY-"Q"Q')
                WHEN 'year' THEN to_char(date_trunc('year', created_at), 'YYYY')
                ELSE to_char(date_trunc('month', created_at), 'YYYY-MM')
            END as period,
            COALESCE(SUM(CASE 
                WHEN type = 'income' THEN amount * exchange_rate
                WHEN type = 'collect' THEN amount * exchange_rate 
                ELSE 0 
            END), 0) as income,
            COALESCE(SUM(CASE 
                WHEN type = 'expense' THEN amount * exchange_rate
                WHEN type = 'repay' THEN amount * exchange_rate
                ELSE 0 
            END), 0) as expense,
            COALESCE(SUM(CASE 
                WHEN type = 'lend' THEN amount * exchange_rate
                ELSE 0 
            END), 0) as lending,
            COALESCE(SUM(CASE 
                WHEN type = 'borrow' THEN amount * exchange_rate
                ELSE 0 
            END), 0) as borrowing,
            jsonb_agg(
                jsonb_build_object(
                    'id', id,
                    'type', type,
                    'amount', amount,
                    'currency', currency,
                    'exchange_rate', exchange_rate,
                    'note', note,
                    'category', category,
                    'created_at', created_at
                )
                ORDER BY created_at DESC
            ) as txns
        FROM transactions
        WHERE 
            machine_id = p_machine_id
            AND status = 'completed'
            AND created_at BETWEEN p_start_date AND p_end_date
            AND currency = p_currency
        GROUP BY 
            CASE p_period_type
                WHEN 'month' THEN date_trunc('month', created_at)
                WHEN 'quarter' THEN date_trunc('quarter', created_at)
                WHEN 'year' THEN date_trunc('year', created_at)
                ELSE date_trunc('month', created_at)
            END
    )
    SELECT
        mt.period,
        mt.income,
        mt.expense,
        mt.lending,
        mt.borrowing,
        (mt.income - mt.expense + mt.borrowing - mt.lending) as net_flow,
        mt.txns as transactions
    FROM monthly_transactions mt
    ORDER BY mt.period DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create RPC function for balance sheet report
CREATE OR REPLACE FUNCTION get_balance_sheet(
    p_machine_id UUID,
    p_currency TEXT DEFAULT 'VND'
) RETURNS TABLE (
    assets JSONB,
    receivables JSONB,
    liabilities JSONB,
    equity JSONB,
    total_assets DECIMAL,
    total_receivables DECIMAL,
    total_liabilities DECIMAL,
    net_worth DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    WITH asset_data AS (
        SELECT 
            jsonb_agg(
                jsonb_build_object(
                    'id', w.id,
                    'name', w.name,
                    'type', w.type,
                    'balance', w.balance,
                    'currency', w.currency
                )
            ) as assets,
            COALESCE(SUM(CASE WHEN currency = p_currency THEN balance ELSE balance * exchange_rate END), 0) as total_assets
        FROM wallets w
        LEFT JOIN (
            SELECT DISTINCT ON (from_wallet_id, to_wallet_id) 
                CASE 
                    WHEN from_wallet_id IS NOT NULL THEN from_wallet_id 
                    ELSE to_wallet_id 
                END as wallet_id,
                exchange_rate
            FROM transactions 
            WHERE status = 'completed'
            AND (from_wallet_id IS NOT NULL OR to_wallet_id IS NOT NULL)
            ORDER BY from_wallet_id, to_wallet_id, created_at DESC
        ) t ON t.wallet_id = w.id
        WHERE w.machine_id = p_machine_id
    ),
    receivable_data AS (
        SELECT 
            jsonb_agg(
                jsonb_build_object(
                    'id', t.id,
                    'type', t.type,
                    'amount', t.amount,
                    'note', t.note,
                    'created_at', t.created_at
                )
            ) as receivables,
            COALESCE(SUM(
                CASE 
                    WHEN t.type = 'lend' THEN t.amount * t.exchange_rate
                    WHEN t.type = 'collect' THEN -t.amount * t.exchange_rate
                    ELSE 0 
                END
            ), 0) as total_receivables
        FROM transactions t
        WHERE t.machine_id = p_machine_id 
        AND t.status = 'completed'
        AND t.type IN ('lend', 'collect')
        AND t.currency = p_currency
    ),
    liability_data AS (
        SELECT 
            jsonb_agg(
                jsonb_build_object(
                    'id', t.id,
                    'type', t.type,
                    'amount', t.amount,
                    'note', t.note,
                    'created_at', t.created_at
                )
            ) as liabilities,
            COALESCE(SUM(
                CASE 
                    WHEN t.type = 'borrow' THEN t.amount * t.exchange_rate
                    WHEN t.type = 'repay' THEN -t.amount * t.exchange_rate
                    ELSE 0 
                END
            ), 0) as total_liabilities
        FROM transactions t
        WHERE t.machine_id = p_machine_id 
        AND t.status = 'completed'
        AND t.type IN ('borrow', 'repay')
        AND t.currency = p_currency
    ),
    equity_data AS (
        SELECT 
            jsonb_agg(
                jsonb_build_object(
                    'id', f.id,
                    'name', f.name,
                    'balance', f.balance,
                    'percent', f.percent,
                    'store_type', s.type
                )
            ) as equity
        FROM funds f
        JOIN stores s ON s.id = f.store_id
        WHERE f.machine_id = p_machine_id 
        AND s.type IN ('reserve', 'expansion')
    )
    SELECT 
        ad.assets,
        rd.receivables,
        ld.liabilities,
        ed.equity,
        ad.total_assets,
        rd.total_receivables,
        ld.total_liabilities,
        (ad.total_assets + rd.total_receivables - ld.total_liabilities) as net_worth
    FROM asset_data ad
    CROSS JOIN receivable_data rd
    CROSS JOIN liability_data ld
    CROSS JOIN equity_data ed;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;