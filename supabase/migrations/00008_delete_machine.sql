-- Function to delete a machine and all its related data
CREATE OR REPLACE FUNCTION delete_machine(
    p_machine_id UUID,
    p_user_id UUID
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_role machine_user_role;
    v_transaction_count INTEGER;
BEGIN
    -- Check if user has owner permission
    SELECT role INTO v_user_role
    FROM machine_users
    WHERE machine_id = p_machine_id
    AND user_id = p_user_id;

    IF v_user_role IS NULL OR v_user_role != 'owner' THEN
        RAISE EXCEPTION 'User does not have permission to delete this machine';
    END IF;

    -- Get count of transactions for logging
    SELECT COUNT(*) INTO v_transaction_count
    FROM transactions
    WHERE machine_id = p_machine_id;

    -- Begin deletion in proper order to respect foreign key constraints
    -- Note: Some of these deletes are redundant due to ON DELETE CASCADE,
    -- but we include them for clarity and logging purposes

    -- 1. Delete all transactions
    DELETE FROM transactions
    WHERE machine_id = p_machine_id;

    -- 2. Delete all wallets
    DELETE FROM wallets
    WHERE machine_id = p_machine_id;

    -- 3. Delete all funds
    DELETE FROM funds
    WHERE machine_id = p_machine_id;

    -- 4. Delete all stores
    DELETE FROM stores
    WHERE machine_id = p_machine_id;

    -- 5. Delete all machine invitations
    DELETE FROM machine_invitations
    WHERE machine_id = p_machine_id;

    -- 6. Delete all machine users
    DELETE FROM machine_users
    WHERE machine_id = p_machine_id;

    -- 7. Finally, delete the machine itself
    DELETE FROM machines
    WHERE id = p_machine_id;

    -- Log the deletion with correct column names
    INSERT INTO operation_logs (
        operation_type,
        entity_type,
        entity_id,
        user_id,
        metadata
    )
    VALUES (
        'DELETE',
        'machine',
        p_machine_id,
        p_user_id,
        jsonb_build_object(
            'transaction_count', v_transaction_count
        )
    );

END;
$$;
