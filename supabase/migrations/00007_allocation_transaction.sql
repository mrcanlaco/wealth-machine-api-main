-- Create allocation transaction function
CREATE OR REPLACE FUNCTION create_allocation_transaction(
  p_machine_id UUID,
  p_user_id UUID,
  p_allocations JSONB -- Array of {fund_id: UUID, amount: DECIMAL}
)
RETURNS TABLE (
  transaction_id UUID,
  fund_id UUID,
  amount DECIMAL,
  new_balance DECIMAL
) AS $$
DECLARE
  v_total_amount DECIMAL;
  v_unallocated_balance DECIMAL;
  v_allocation RECORD;
  v_transaction_id UUID;
BEGIN
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

  -- Get current unallocated balance
  SELECT un_allocated INTO v_unallocated_balance
  FROM machines
  WHERE id = p_machine_id;

  -- Calculate total allocation amount
  SELECT COALESCE(SUM((value->>'amount')::DECIMAL), 0)
  INTO v_total_amount
  FROM jsonb_array_elements(p_allocations);

  -- Validate total amount does not exceed unallocated balance
  IF v_total_amount > v_unallocated_balance THEN
    RAISE EXCEPTION 'Tổng số tiền phân bổ (%) vượt quá số dư chưa phân bổ (%)', 
      v_total_amount, v_unallocated_balance;
  END IF;

  -- Create temporary table for results
  CREATE TEMP TABLE temp_results (
    transaction_id UUID,
    fund_id UUID,
    amount DECIMAL,
    new_balance DECIMAL
  ) ON COMMIT DROP;

  -- Create main allocation transaction
  INSERT INTO transactions (
    id,
    machine_id,
    type,
    status,
    amount,
    note,
    meta,
    created_by,
    to_fund_id
  ) VALUES (
    gen_random_uuid(),
    p_machine_id,
    'allocation',
    'completed',
    v_total_amount,
    'Phân bổ số dư chưa phân bổ',
    jsonb_build_object('allocations', p_allocations),
    p_user_id,
    (SELECT (value->>'fund_id')::UUID 
     FROM jsonb_array_elements(p_allocations) LIMIT 1)
  ) RETURNING id INTO v_transaction_id;

  -- Process each allocation
  FOR v_allocation IN 
    SELECT 
      (value->>'fund_id')::UUID AS fund_id,
      (value->>'amount')::DECIMAL AS amount
    FROM jsonb_array_elements(p_allocations)
  LOOP
    -- Update fund balance and store result
    WITH updated AS (
      UPDATE funds 
      SET balance = balance + v_allocation.amount
      WHERE id = v_allocation.fund_id AND machine_id = p_machine_id
      RETURNING id, balance
    )
    INSERT INTO temp_results (transaction_id, fund_id, amount, new_balance)
    SELECT v_transaction_id, id, v_allocation.amount, balance
    FROM updated;

    -- Create sub-transaction for this allocation
    INSERT INTO transactions (
      machine_id,
      type,
      status,
      amount,
      to_fund_id,
      related_transaction_id,
      note,
      created_by
    ) VALUES (
      p_machine_id,
      'allocation',
      'completed',
      v_allocation.amount,
      v_allocation.fund_id,
      v_transaction_id,
      'Phân bổ vào quỹ',
      p_user_id
    );
  END LOOP;

  -- Update machine unallocated balance
  UPDATE machines 
  SET un_allocated = un_allocated - v_total_amount
  WHERE id = p_machine_id;

  -- Return results and cleanup will happen automatically due to ON COMMIT DROP
  RETURN QUERY 
  SELECT * FROM temp_results;
END;
$$ LANGUAGE plpgsql;
