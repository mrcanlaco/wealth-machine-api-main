-- Create function to manage stores and funds
CREATE OR REPLACE FUNCTION save_stores_funds(
    p_user_id UUID,
    p_machine_id UUID,
    p_stores JSONB
) RETURNS JSONB AS $$
DECLARE
    v_store JSONB;
    v_fund JSONB;
    v_store_id UUID;
    v_store_record stores%ROWTYPE;
    v_fund_record funds%ROWTYPE;
    v_result JSONB := '{"stores": [], "funds": []}';
    v_total_percent DECIMAL := 0;
BEGIN
    -- Verify user has access to machine
    IF NOT EXISTS (
        SELECT 1 FROM machine_users 
        WHERE user_id = p_user_id 
        AND machine_id = p_machine_id
    ) THEN
        RAISE EXCEPTION 'User does not have access to this machine';
    END IF;

    -- Calculate total percentage across all stores being created or updated
    SELECT COALESCE(SUM(
        CASE 
            WHEN store->>'action' != 'delete' THEN
                (
                    SELECT COALESCE(SUM(
                        CASE 
                            WHEN fund->>'action' != 'delete' THEN
                                (fund->>'percent')::DECIMAL
                            ELSE 0
                        END
                    ), 0)
                    FROM jsonb_array_elements(store->'funds') fund
                )
            ELSE 0
        END
    ), 0)
    INTO v_total_percent
    FROM jsonb_array_elements(p_stores) store;

    -- Verify total percentage does not exceed 100%
    IF v_total_percent > 100 THEN
        RAISE EXCEPTION 'Total percentage across all stores exceeds 100%%';
    END IF;

    -- Process each store
    FOR v_store IN SELECT * FROM jsonb_array_elements(p_stores)
    LOOP
        CASE v_store->>'action'
            WHEN 'create' THEN
                INSERT INTO stores (
                    machine_id,
                    name,
                    icon,
                    type,
                    meta
                ) VALUES (
                    p_machine_id,
                    v_store->>'name',
                    v_store->>'icon',
                    (v_store->>'type')::store_type,
                    jsonb_build_object(
                        'tags',
                        COALESCE(
                            (v_store->'meta'->'tags'),
                            '[]'::jsonb
                        )
                    )
                ) RETURNING * INTO v_store_record;
                
                v_store_id := v_store_record.id;
                v_result := jsonb_set(
                    v_result,
                    '{stores}',
                    (v_result->'stores') || jsonb_build_object(
                        'id', v_store_record.id,
                        'action', 'created'
                    )
                );

            WHEN 'update' THEN
                UPDATE stores
                SET name = v_store->>'name',
                    icon = v_store->>'icon',
                    type = (v_store->>'type')::store_type,
                    meta = CASE
                        WHEN v_store->'meta'->'tags' IS NOT NULL THEN
                            -- If new tags are provided, update them while keeping other meta fields
                            meta || jsonb_build_object('tags', v_store->'meta'->'tags')
                        ELSE
                            -- If no new tags, keep existing meta unchanged
                            meta
                        END,
                    updated_at = NOW()
                WHERE id = (v_store->>'id')::UUID
                AND machine_id = p_machine_id
                RETURNING * INTO v_store_record;

                v_store_id := v_store_record.id;
                v_result := jsonb_set(
                    v_result,
                    '{stores}',
                    (v_result->'stores') || jsonb_build_object(
                        'id', v_store_record.id,
                        'action', 'updated'
                    )
                );

            WHEN 'delete' THEN
                DELETE FROM stores
                WHERE id = (v_store->>'id')::UUID
                AND machine_id = p_machine_id
                RETURNING * INTO v_store_record;

                v_result := jsonb_set(
                    v_result,
                    '{stores}',
                    (v_result->'stores') || jsonb_build_object(
                        'id', v_store_record.id,
                        'action', 'deleted'
                    )
                );
                
                -- Skip processing funds for deleted store
                CONTINUE;
        END CASE;

        -- Process funds for this store
        IF v_store->'funds' IS NOT NULL THEN
            FOR v_fund IN SELECT * FROM jsonb_array_elements(v_store->'funds')
            LOOP
                CASE v_fund->>'action'
                    WHEN 'create' THEN
                        INSERT INTO funds (
                            machine_id,
                            store_id,
                            name,
                            icon,
                            percent
                        ) VALUES (
                            p_machine_id,
                            v_store_id,
                            v_fund->>'name',
                            v_fund->>'icon',
                            (v_fund->>'percent')::DECIMAL
                        ) RETURNING * INTO v_fund_record;

                        v_result := jsonb_set(
                            v_result,
                            '{funds}',
                            (v_result->'funds') || jsonb_build_object(
                                'id', v_fund_record.id,
                                'action', 'created'
                            )
                        );

                    WHEN 'update' THEN
                        UPDATE funds
                        SET name = v_fund->>'name',
                            icon = v_fund->>'icon',
                            percent = (v_fund->>'percent')::DECIMAL,
                            updated_at = NOW()
                        WHERE id = (v_fund->>'id')::UUID
                        AND machine_id = p_machine_id
                        AND store_id = v_store_id
                        RETURNING * INTO v_fund_record;

                        v_result := jsonb_set(
                            v_result,
                            '{funds}',
                            (v_result->'funds') || jsonb_build_object(
                                'id', v_fund_record.id,
                                'action', 'updated'
                            )
                        );

                    WHEN 'delete' THEN
                        DELETE FROM funds
                        WHERE id = (v_fund->>'id')::UUID
                        AND machine_id = p_machine_id
                        AND store_id = v_store_id
                        RETURNING * INTO v_fund_record;

                        v_result := jsonb_set(
                            v_result,
                            '{funds}',
                            (v_result->'funds') || jsonb_build_object(
                                'id', v_fund_record.id,
                                'action', 'deleted'
                            )
                        );
                END CASE;
            END LOOP;
        END IF;
    END LOOP;

    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION save_stores_funds TO authenticated;
