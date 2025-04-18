CREATE OR REPLACE FUNCTION process_transaction(
    p_machine_id UUID,
    p_user_id UUID,
    p_from_wallet_id UUID,
    p_to_wallet_id UUID,
    p_from_fund_id UUID,
    p_to_fund_id UUID,
    p_type transaction_type,
    p_amount DECIMAL(20,2),
    p_currency TEXT,
    p_exchange_rate DECIMAL(20,6),
    p_note TEXT,
    p_category TEXT,
    p_tags TEXT[],
    p_related_transaction_id UUID,
    p_meta JSONB
) RETURNS transactions AS $$
#variable_conflict use_column
DECLARE
    v_transaction transactions;
    v_converted_amount DECIMAL(20,2);
    v_machine_un_allocated DECIMAL(20,2);
    v_from_store_type store_type;
    v_to_store_type store_type;
    v_rows_affected INTEGER;
BEGIN
    -- Validate required inputs
    IF p_machine_id IS NULL THEN
        RAISE EXCEPTION 'Machine ID is required';
    END IF;

    IF p_user_id IS NULL THEN
        RAISE EXCEPTION 'User ID is required';
    END IF;

    IF p_type IS NULL THEN
        RAISE EXCEPTION 'Transaction type is required';
    END IF;

    IF p_amount IS NULL OR p_amount <= 0 THEN
        RAISE EXCEPTION 'Amount must be positive';
    END IF;

    IF p_exchange_rate IS NULL OR p_exchange_rate <= 0 THEN
        RAISE EXCEPTION 'Exchange rate must be positive';
    END IF;

    -- Validate machine exists and user has access
    IF NOT EXISTS (
        SELECT 1 
        FROM machines m
        JOIN machine_users mu ON mu.machine_id = m.id
        WHERE m.id = p_machine_id 
        AND mu.user_id = p_user_id
    ) THEN
        RAISE EXCEPTION 'Machine not found or access denied';
    END IF;

    -- Get store types if funds are provided
    IF p_from_fund_id IS NOT NULL THEN
        -- Kiểm tra quỹ thuộc về máy
        IF NOT EXISTS (
            SELECT 1 FROM funds
            WHERE id = p_from_fund_id 
            AND machine_id = p_machine_id
        ) THEN
            RAISE EXCEPTION 'Quỹ nguồn không thuộc về máy này';
        END IF;

        -- Kiểm tra số dư quỹ
        IF NOT EXISTS (
            SELECT 1 FROM funds
            WHERE id = p_from_fund_id 
            AND balance >= p_amount
        ) THEN
            RAISE EXCEPTION 'Số dư quỹ không đủ';
        END IF;

        -- Lấy loại kho
        SELECT s.type INTO v_from_store_type
        FROM stores s
        JOIN funds f ON f.store_id = s.id
        WHERE f.id = p_from_fund_id;

        IF NOT FOUND THEN
            RAISE EXCEPTION 'Source fund not found or does not belong to a store';
        END IF;
    END IF;

    IF p_to_fund_id IS NOT NULL THEN
        -- Kiểm tra quỹ thuộc về máy
        IF NOT EXISTS (
            SELECT 1 FROM funds
            WHERE id = p_to_fund_id 
            AND machine_id = p_machine_id
        ) THEN
            RAISE EXCEPTION 'Quỹ đích không thuộc về máy này';
        END IF;

        -- Lấy loại kho
        SELECT s.type INTO v_to_store_type
        FROM stores s
        JOIN funds f ON f.store_id = s.id
        WHERE f.id = p_to_fund_id;

        IF NOT FOUND THEN
            RAISE EXCEPTION 'Destination fund not found or does not belong to a store';
        END IF;
    END IF;

    -- Calculate converted amount
    v_converted_amount := p_amount * p_exchange_rate;

    -- Get current unallocated balance
    SELECT un_allocated INTO v_machine_un_allocated
    FROM machines
    WHERE id = p_machine_id;

    -- Validate wallet ownership and get balances
    IF p_from_wallet_id IS NOT NULL THEN
        IF NOT EXISTS (
            SELECT 1
            FROM wallets
            WHERE id = p_from_wallet_id AND machine_id = p_machine_id
        ) THEN
            RAISE EXCEPTION 'Source wallet not found or does not belong to the specified machine';
        END IF;

        -- Check wallet balance
        IF NOT EXISTS (
            SELECT 1
            FROM wallets
            WHERE id = p_from_wallet_id AND balance >= v_converted_amount
        ) THEN
            RAISE EXCEPTION 'Insufficient wallet balance';
        END IF;
    END IF;

    IF p_to_wallet_id IS NOT NULL THEN
        IF NOT EXISTS (
            SELECT 1
            FROM wallets
            WHERE id = p_to_wallet_id AND machine_id = p_machine_id
        ) THEN
            RAISE EXCEPTION 'Destination wallet not found or does not belong to the specified machine';
        END IF;
    END IF;

    -- Start transaction processing
    BEGIN
        -- Create transaction record
        INSERT INTO transactions (
            machine_id,
            from_wallet_id,
            to_wallet_id,
            from_fund_id,
            to_fund_id,
            type,
            status,
            amount,
            currency,
            exchange_rate,
            note,
            category,
            tags,
            related_transaction_id,
            meta,
            created_by
        ) VALUES (
            p_machine_id,
            p_from_wallet_id,
            p_to_wallet_id,
            p_from_fund_id,
            p_to_fund_id,
            p_type,
            'completed',
            p_amount,
            COALESCE(p_currency, 'VND'),
            COALESCE(p_exchange_rate, 1),
            p_note,
            p_category,
            COALESCE(p_tags, ARRAY[]::TEXT[]),
            p_related_transaction_id,
            COALESCE(p_meta, '{}'::JSONB),
            p_user_id
        ) RETURNING * INTO v_transaction;

        -- Process based on transaction type
        CASE p_type
            WHEN 'income' THEN
                -- Check destination fund if specified
                IF p_to_fund_id IS NOT NULL THEN
                    IF NOT EXISTS (
                        SELECT 1 FROM funds
                        WHERE id = p_to_fund_id 
                        AND machine_id = p_machine_id
                    ) THEN
                        RAISE EXCEPTION 'Destination fund not found or does not belong to the specified machine';
                    END IF;

                    -- Update fund balance
                    UPDATE funds
                    SET balance = balance + p_amount
                    WHERE id = p_to_fund_id;
                    
                    GET DIAGNOSTICS v_rows_affected = ROW_COUNT;
                    IF v_rows_affected = 0 THEN
                        RAISE EXCEPTION 'Failed to update destination fund balance';
                    END IF;
                END IF;

                -- Add to wallet if specified
                IF p_to_wallet_id IS NOT NULL THEN
                    -- Check if wallet exists and belongs to machine
                    IF NOT EXISTS (
                        SELECT 1
                        FROM wallets
                        WHERE id = p_to_wallet_id AND machine_id = p_machine_id
                    ) THEN
                        RAISE EXCEPTION 'Destination wallet not found or does not belong to the specified machine';
                    END IF;

                    UPDATE wallets
                    SET balance = balance + v_converted_amount
                    WHERE id = p_to_wallet_id;
                    
                    GET DIAGNOSTICS v_rows_affected = ROW_COUNT;
                    IF v_rows_affected = 0 THEN
                        RAISE EXCEPTION 'Failed to update destination wallet balance';
                    END IF;
                END IF;

                -- Update machine un_allocated
                UPDATE machines
                SET un_allocated = v_machine_un_allocated + p_amount
                WHERE id = p_machine_id;
                
                GET DIAGNOSTICS v_rows_affected = ROW_COUNT;
                IF v_rows_affected = 0 THEN
                    RAISE EXCEPTION 'Failed to update machine unallocated balance';
                END IF;

            WHEN 'expense' THEN
                -- Check unallocated balance if expense from income store
                IF v_from_store_type = 'income' THEN
                    IF v_machine_un_allocated < p_amount THEN
                        RAISE EXCEPTION 'Số tiền chi (%) vượt quá số dư chưa phân bổ (%)', 
                            p_amount, v_machine_un_allocated;
                    END IF;
                END IF;

                -- Subtract from wallet
                IF p_from_wallet_id IS NOT NULL THEN
                    UPDATE wallets
                    SET balance = balance - v_converted_amount
                    WHERE id = p_from_wallet_id;
                    
                    GET DIAGNOSTICS v_rows_affected = ROW_COUNT;
                    IF v_rows_affected = 0 THEN
                        RAISE EXCEPTION 'Failed to update source wallet balance';
                    END IF;
                END IF;
                
                -- Subtract from fund
                IF p_from_fund_id IS NOT NULL THEN
                    UPDATE funds
                    SET balance = balance - p_amount
                    WHERE id = p_from_fund_id;
                    
                    GET DIAGNOSTICS v_rows_affected = ROW_COUNT;
                    IF v_rows_affected = 0 THEN
                        RAISE EXCEPTION 'Failed to update source fund balance';
                    END IF;
                END IF;

                -- Update machine un_allocated only if expense from income store
                IF v_from_store_type = 'income' THEN
                    UPDATE machines
                    SET un_allocated = v_machine_un_allocated - p_amount
                    WHERE id = p_machine_id;
                    
                    GET DIAGNOSTICS v_rows_affected = ROW_COUNT;
                    IF v_rows_affected = 0 THEN
                        RAISE EXCEPTION 'Failed to update machine unallocated balance';
                    END IF;
                END IF;

            WHEN 'borrow' THEN
                -- Add borrowed money to wallet
                IF p_to_wallet_id IS NOT NULL THEN
                    UPDATE wallets
                    SET balance = balance + v_converted_amount
                    WHERE id = p_to_wallet_id;
                    
                    GET DIAGNOSTICS v_rows_affected = ROW_COUNT;
                    IF v_rows_affected = 0 THEN
                        RAISE EXCEPTION 'Failed to update destination wallet balance';
                    END IF;
                END IF;

                -- Add to fund
                IF p_to_fund_id IS NOT NULL THEN
                    -- Only allow borrow to income store
                    IF v_to_store_type != 'income' THEN
                        RAISE EXCEPTION 'Borrow transaction can only go to income store';
                    END IF;

                    UPDATE funds
                    SET balance = balance + p_amount
                    WHERE id = p_to_fund_id;
                    
                    GET DIAGNOSTICS v_rows_affected = ROW_COUNT;
                    IF v_rows_affected = 0 THEN
                        RAISE EXCEPTION 'Failed to update destination fund balance';
                    END IF;
                END IF;

                -- Update machine un_allocated
                UPDATE machines
                SET un_allocated = v_machine_un_allocated + p_amount
                WHERE id = p_machine_id;
                
                GET DIAGNOSTICS v_rows_affected = ROW_COUNT;
                IF v_rows_affected = 0 THEN
                    RAISE EXCEPTION 'Failed to update machine unallocated balance';
                END IF;

            WHEN 'collect' THEN
                -- Add collected money to wallet
                IF p_to_wallet_id IS NOT NULL THEN
                    UPDATE wallets
                    SET balance = balance + v_converted_amount
                    WHERE id = p_to_wallet_id;
                    
                    GET DIAGNOSTICS v_rows_affected = ROW_COUNT;
                    IF v_rows_affected = 0 THEN
                        RAISE EXCEPTION 'Failed to update destination wallet balance';
                    END IF;
                END IF;

                -- Add to fund
                IF p_to_fund_id IS NOT NULL THEN
                    -- Only allow collect to income store
                    IF v_to_store_type != 'income' THEN
                        RAISE EXCEPTION 'Collect transaction can only go to income store';
                    END IF;

                    UPDATE funds
                    SET balance = balance + p_amount
                    WHERE id = p_to_fund_id;
                    
                    GET DIAGNOSTICS v_rows_affected = ROW_COUNT;
                    IF v_rows_affected = 0 THEN
                        RAISE EXCEPTION 'Failed to update destination fund balance';
                    END IF;
                END IF;

                -- Update machine un_allocated
                UPDATE machines
                SET un_allocated = v_machine_un_allocated + p_amount
                WHERE id = p_machine_id;
                
                GET DIAGNOSTICS v_rows_affected = ROW_COUNT;
                IF v_rows_affected = 0 THEN
                    RAISE EXCEPTION 'Failed to update machine unallocated balance';
                END IF;

            WHEN 'lend' THEN
                -- Check unallocated balance if lending from income store
                IF v_from_store_type = 'income' THEN
                    IF v_machine_un_allocated < p_amount THEN
                        RAISE EXCEPTION 'Số tiền cho vay (%) vượt quá số dư chưa phân bổ (%)', 
                            p_amount, v_machine_un_allocated;
                    END IF;
                END IF;

                -- Subtract lent money from wallet
                IF p_from_wallet_id IS NOT NULL THEN
                    UPDATE wallets
                    SET balance = balance - v_converted_amount
                    WHERE id = p_from_wallet_id;
                    
                    GET DIAGNOSTICS v_rows_affected = ROW_COUNT;
                    IF v_rows_affected = 0 THEN
                        RAISE EXCEPTION 'Failed to update source wallet balance';
                    END IF;
                END IF;

                -- Subtract from fund
                IF p_from_fund_id IS NOT NULL THEN
                    UPDATE funds
                    SET balance = balance - p_amount
                    WHERE id = p_from_fund_id;
                    
                    GET DIAGNOSTICS v_rows_affected = ROW_COUNT;
                    IF v_rows_affected = 0 THEN
                        RAISE EXCEPTION 'Failed to update source fund balance';
                    END IF;
                END IF;

                -- Update machine un_allocated only if lending from income store
                IF v_from_store_type = 'income' THEN
                    UPDATE machines
                    SET un_allocated = v_machine_un_allocated - p_amount
                    WHERE id = p_machine_id;
                    
                    GET DIAGNOSTICS v_rows_affected = ROW_COUNT;
                    IF v_rows_affected = 0 THEN
                        RAISE EXCEPTION 'Failed to update machine unallocated balance';
                    END IF;
                END IF;

            WHEN 'repay' THEN
                -- Check unallocated balance if repaying from income store
                IF v_from_store_type = 'income' THEN
                    IF v_machine_un_allocated < p_amount THEN
                        RAISE EXCEPTION 'Số tiền trả nợ (%) vượt quá số dư chưa phân bổ (%)', 
                            p_amount, v_machine_un_allocated;
                    END IF;
                END IF;

                -- Subtract repayment from wallet
                IF p_from_wallet_id IS NOT NULL THEN
                    UPDATE wallets
                    SET balance = balance - v_converted_amount
                    WHERE id = p_from_wallet_id;
                    
                    GET DIAGNOSTICS v_rows_affected = ROW_COUNT;
                    IF v_rows_affected = 0 THEN
                        RAISE EXCEPTION 'Failed to update source wallet balance';
                    END IF;
                END IF;

                -- Subtract from fund
                IF p_from_fund_id IS NOT NULL THEN
                    UPDATE funds
                    SET balance = balance - p_amount
                    WHERE id = p_from_fund_id;
                    
                    GET DIAGNOSTICS v_rows_affected = ROW_COUNT;
                    IF v_rows_affected = 0 THEN
                        RAISE EXCEPTION 'Failed to update source fund balance';
                    END IF;
                END IF;

                -- Update machine un_allocated only if repaying from income store
                IF v_from_store_type = 'income' THEN
                    UPDATE machines
                    SET un_allocated = v_machine_un_allocated - p_amount
                    WHERE id = p_machine_id;
                    
                    GET DIAGNOSTICS v_rows_affected = ROW_COUNT;
                    IF v_rows_affected = 0 THEN
                        RAISE EXCEPTION 'Failed to update machine unallocated balance';
                    END IF;
                END IF;

            WHEN 'transfer_refundable', 'transfer_non_refundable' THEN
                -- Transfer between funds (update un_allocated if transferring from income store)
                UPDATE funds
                SET balance = balance - p_amount
                WHERE id = p_from_fund_id;
                
                GET DIAGNOSTICS v_rows_affected = ROW_COUNT;
                IF v_rows_affected = 0 THEN
                    RAISE EXCEPTION 'Failed to update source fund balance';
                END IF;
                
                UPDATE funds
                SET balance = balance + p_amount
                WHERE id = p_to_fund_id;
                
                GET DIAGNOSTICS v_rows_affected = ROW_COUNT;
                IF v_rows_affected = 0 THEN
                    RAISE EXCEPTION 'Failed to update destination fund balance';
                END IF;

                -- Update un_allocated if transferring from income store to other stores
                IF v_from_store_type = 'income' AND v_to_store_type != 'income' THEN
                    UPDATE machines
                    SET un_allocated = v_machine_un_allocated - p_amount
                    WHERE id = p_machine_id;
                    
                    GET DIAGNOSTICS v_rows_affected = ROW_COUNT;
                    IF v_rows_affected = 0 THEN
                        RAISE EXCEPTION 'Failed to update machine unallocated balance';
                    END IF;
                END IF;

            WHEN 'money_transfer' THEN
                -- Transfer between wallets (no effect on un_allocated)
                UPDATE wallets
                SET balance = balance - v_converted_amount
                WHERE id = p_from_wallet_id;
                
                GET DIAGNOSTICS v_rows_affected = ROW_COUNT;
                IF v_rows_affected = 0 THEN
                    RAISE EXCEPTION 'Failed to update source wallet balance';
                END IF;
                
                UPDATE wallets
                SET balance = balance + v_converted_amount
                WHERE id = p_to_wallet_id;
                
                GET DIAGNOSTICS v_rows_affected = ROW_COUNT;
                IF v_rows_affected = 0 THEN
                    RAISE EXCEPTION 'Failed to update destination wallet balance';
                END IF;

            ELSE
                RAISE EXCEPTION 'Unsupported transaction type: %', p_type;
        END CASE;

        -- Return the created transaction with related data
        SELECT t.*,
            fw.id AS from_wallet_id, fw.name AS from_wallet_name,
            tw.id AS to_wallet_id, tw.name AS to_wallet_name,
            ff.id AS from_fund_id, ff.name AS from_fund_name,
            tf.id AS to_fund_id, tf.name AS to_fund_name,
            st.* AS sub_transactions
        INTO v_transaction
        FROM transactions t
        LEFT JOIN wallets fw ON t.from_wallet_id = fw.id
        LEFT JOIN wallets tw ON t.to_wallet_id = tw.id
        LEFT JOIN funds ff ON t.from_fund_id = ff.id
        LEFT JOIN funds tf ON t.to_fund_id = tf.id
        LEFT JOIN transactions st ON t.id = st.related_transaction_id
        WHERE t.id = v_transaction.id;

        -- Return the transaction with related data
        RETURN v_transaction;
    EXCEPTION
        WHEN OTHERS THEN
            -- Re-raise the error with additional context
            RAISE EXCEPTION 'Transaction processing failed: %', SQLERRM;
    END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
