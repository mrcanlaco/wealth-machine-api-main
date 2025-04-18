-- Add additional indexes for reporting queries
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_currency ON transactions(currency);
CREATE INDEX IF NOT EXISTS idx_transactions_type_created_at ON transactions(type, created_at);
CREATE INDEX IF NOT EXISTS idx_wallets_currency ON wallets(currency);

-- Create logging table
CREATE TABLE IF NOT EXISTS operation_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    operation_type TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    user_id UUID REFERENCES auth.users(id),
    old_data JSONB,
    new_data JSONB,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_operation_logs_entity ON operation_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_operation_logs_user ON operation_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_operation_logs_created_at ON operation_logs(created_at);

ALTER TABLE operation_logs ENABLE ROW LEVEL SECURITY;
-- Add logging trigger function
CREATE OR REPLACE FUNCTION log_operation()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO operation_logs (
        operation_type,
        entity_type,
        entity_id,
        user_id,
        old_data,
        new_data,
        metadata
    ) VALUES (
        TG_OP,
        TG_TABLE_NAME,
        CASE
            WHEN TG_OP = 'DELETE' THEN OLD.id
            ELSE NEW.id
        END,
        auth.uid(),
        CASE 
            WHEN TG_OP = 'DELETE' THEN row_to_json(OLD)::jsonb
            WHEN TG_OP = 'UPDATE' THEN row_to_json(OLD)::jsonb
            ELSE NULL
        END,
        CASE
            WHEN TG_OP = 'DELETE' THEN NULL
            ELSE row_to_json(NEW)::jsonb
        END,
        jsonb_build_object(
            'timestamp', now(),
            'client_info', current_setting('request.headers', true)::jsonb
        )
    );
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add triggers for logging
CREATE TRIGGER log_transactions_changes
    AFTER INSERT OR UPDATE OR DELETE ON transactions
    FOR EACH ROW EXECUTE FUNCTION log_operation();

CREATE TRIGGER log_wallets_changes
    AFTER INSERT OR UPDATE OR DELETE ON wallets
    FOR EACH ROW EXECUTE FUNCTION log_operation();

CREATE TRIGGER log_funds_changes
    AFTER INSERT OR UPDATE OR DELETE ON funds
    FOR EACH ROW EXECUTE FUNCTION log_operation();