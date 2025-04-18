-- Function to create a new machine with stores, funds, and wallets
CREATE OR REPLACE FUNCTION create_machine(
    p_user_id UUID,
    p_name TEXT,
    p_icon TEXT DEFAULT NULL,
    p_currency TEXT DEFAULT 'VND',
    p_config JSONB DEFAULT '{}',
    p_meta JSONB DEFAULT '{}',
    p_stores JSONB DEFAULT '[]',
    p_wallets JSONB DEFAULT '[]'
)
RETURNS machines
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_machine_id UUID;
    v_store_record RECORD;
    v_fund_record RECORD;
    v_wallet_record RECORD;
    v_total_wallet_balance DECIMAL := 0;
    v_total_fund_percent DECIMAL := 0;
    v_result machines;
BEGIN
    -- Create machine
    INSERT INTO machines (name, icon, currency, config, meta, un_allocated)
    VALUES (p_name, p_icon, p_currency, p_config, p_meta, 0)
    RETURNING id INTO v_machine_id;

    -- Create machine owner
    INSERT INTO machine_users (machine_id, user_id, role)
    VALUES (v_machine_id, p_user_id, 'owner');

    -- Calculate total wallet balance
    SELECT COALESCE(SUM(CAST(value->>'balance' AS DECIMAL)), 0)
    INTO v_total_wallet_balance
    FROM jsonb_array_elements(p_wallets);

    -- Calculate total fund percentages across all stores (excluding income stores)
    RAISE NOTICE 'Stores input: %', p_stores;
    
    WITH store_funds AS (
        SELECT s.store->'funds' as funds
        FROM jsonb_array_elements(p_stores) AS s(store)
        WHERE (store->>'type')::store_type != 'income'
    ),
    flattened_funds AS (
        SELECT jsonb_array_elements(funds)->>'percent' as fund_percent
        FROM store_funds
    )
    SELECT COALESCE(SUM(CAST(fund_percent AS DECIMAL)), 0)
    INTO v_total_fund_percent
    FROM flattened_funds;

    RAISE NOTICE 'Total fund percent: %', v_total_fund_percent;

    IF v_total_fund_percent > 100 THEN
        RAISE EXCEPTION 'Total fund percentage cannot exceed 100%%. Current total: %', v_total_fund_percent;
    END IF;

    -- Create stores and funds
    FOR v_store_record IN SELECT * FROM jsonb_to_recordset(p_stores) 
        AS x(name text, type store_type, icon text, funds jsonb)
    LOOP
        DECLARE
            v_store_id UUID;
            v_store_name text := v_store_record.name;
        BEGIN
            -- Create store
            INSERT INTO stores (machine_id, name, type, icon)
            VALUES (v_machine_id, v_store_record.name, v_store_record.type, v_store_record.icon)
            RETURNING id INTO v_store_id;

            -- Create funds for this store
            FOR v_fund_record IN SELECT * FROM jsonb_to_recordset(v_store_record.funds)
                AS x(name text, icon text, percent decimal)
            LOOP
                IF v_fund_record.percent < 0 OR v_fund_record.percent > 100 THEN
                    RAISE EXCEPTION 'Fund "%" percentage must be between 0 and 100', v_fund_record.name;
                END IF;

                INSERT INTO funds (machine_id, store_id, name, icon, percent)
                VALUES (v_machine_id, v_store_id, v_fund_record.name, v_fund_record.icon, v_fund_record.percent);
            END LOOP;
        END;
    END LOOP;

    -- Create wallets
    FOR v_wallet_record IN SELECT * FROM jsonb_to_recordset(p_wallets)
        AS x(name text, type wallet_type, icon text, balance decimal, currency text)
    LOOP
        IF v_wallet_record.balance < 0 THEN
            RAISE EXCEPTION 'Wallet "%" balance cannot be negative', v_wallet_record.name;
        END IF;

        INSERT INTO wallets (machine_id, name, type, icon, balance, currency)
        VALUES (v_machine_id, v_wallet_record.name, v_wallet_record.type, v_wallet_record.icon, 
                v_wallet_record.balance, v_wallet_record.currency);
    END LOOP;

    -- Update machine's unallocated balance
    UPDATE machines 
    SET un_allocated = v_total_wallet_balance
    WHERE id = v_machine_id;

    -- Return the created machine
    SELECT * INTO v_result FROM machines WHERE id = v_machine_id;
    RETURN v_result;
END;
$$;
