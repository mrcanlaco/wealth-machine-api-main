-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Set up storage for user avatars and icons
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('icons', 'icons', true);

-- Create enum types
CREATE TYPE machine_user_role AS ENUM ('owner', 'member');
CREATE TYPE invitation_status AS ENUM ('pending', 'accepted', 'rejected');
CREATE TYPE store_type AS ENUM ('income', 'expense', 'reserve', 'expansion', 'business');
CREATE TYPE wallet_type AS ENUM ('cash', 'bank', 'crypto', 'savings');
CREATE TYPE transaction_type AS ENUM (
    'income', 'expense', 'borrow', 'collect', 
    'lend', 'repay', 'transfer_refundable', 
    'transfer_non_refundable', 'money_transfer', 'allocation');
CREATE TYPE transaction_status AS ENUM ('pending', 'completed', 'cancelled', 'failed');

-- Create tables
CREATE TABLE machines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    icon TEXT,
    un_allocated DECIMAL(20,2) DEFAULT 0,
    currency TEXT DEFAULT 'VND',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    config JSONB DEFAULT '{}',
    meta JSONB DEFAULT '{}'
);

CREATE TABLE machine_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    machine_id UUID REFERENCES machines(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role machine_user_role NOT NULL,
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    invited_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(machine_id, user_id)
);

CREATE TABLE machine_invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    machine_id UUID REFERENCES machines(id) ON DELETE CASCADE,
    invited_email TEXT NOT NULL,
    invited_by UUID REFERENCES auth.users(id),
    status invitation_status NOT NULL DEFAULT 'pending',
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(machine_id, invited_email)
);

CREATE TABLE stores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    machine_id UUID REFERENCES machines(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    icon TEXT,
    type store_type NOT NULL,
    config JSONB DEFAULT '{}',
    meta JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE funds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    machine_id UUID REFERENCES machines(id) ON DELETE CASCADE,
    store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    icon TEXT,
    balance DECIMAL(20,2) DEFAULT 0,
    percent DECIMAL(5,2) DEFAULT 0,
    config JSONB DEFAULT '{}',
    meta JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    machine_id UUID REFERENCES machines(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    icon TEXT,
    type wallet_type NOT NULL,
    balance DECIMAL(20,2) DEFAULT 0,
    currency TEXT DEFAULT 'VND',
    config JSONB DEFAULT '{}',
    meta JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    machine_id UUID NOT NULL REFERENCES machines(id) ON DELETE CASCADE,
    from_wallet_id UUID REFERENCES wallets(id) ON DELETE SET NULL,
    to_wallet_id UUID REFERENCES wallets(id) ON DELETE SET NULL,
    from_fund_id UUID REFERENCES funds(id) ON DELETE SET NULL,
    to_fund_id UUID REFERENCES funds(id) ON DELETE SET NULL,
    type transaction_type NOT NULL,
    status transaction_status NOT NULL DEFAULT 'pending',
    amount DECIMAL(20,2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'VND',
    exchange_rate DECIMAL(20,6) NOT NULL DEFAULT 1,
    note TEXT,
    category TEXT,
    tags TEXT[],
    location JSONB,
    participants JSONB,
    images TEXT[],
    event JSONB,
    reminder JSONB,
    related_transaction_id UUID REFERENCES transactions(id) ON DELETE SET NULL,
    meta JSONB DEFAULT '{}',
    created_by UUID NOT NULL REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add constraints for positive amounts and exchange rates
ALTER TABLE transactions 
    ADD CONSTRAINT positive_amount CHECK (amount > 0),
    ADD CONSTRAINT positive_exchange_rate CHECK (exchange_rate > 0);

-- Add constraints for valid transaction types
ALTER TABLE transactions
    ADD CONSTRAINT valid_wallet_transfer CHECK (
        (type = 'money_transfer' AND from_wallet_id IS NOT NULL AND to_wallet_id IS NOT NULL) OR
        (type != 'money_transfer')
    ),
    ADD CONSTRAINT valid_fund_transfer CHECK (
        (type IN ('transfer_refundable', 'transfer_non_refundable') AND from_fund_id IS NOT NULL AND to_fund_id IS NOT NULL) OR
        (type NOT IN ('transfer_refundable', 'transfer_non_refundable'))
    ),
    ADD CONSTRAINT valid_income CHECK (
        (type = 'income' AND to_wallet_id IS NOT NULL AND to_fund_id IS NOT NULL) OR
        (type != 'income')
    ),
    ADD CONSTRAINT valid_expense CHECK (
        (type = 'expense' AND from_wallet_id IS NOT NULL AND from_fund_id IS NOT NULL) OR
        (type != 'expense')
    ),
    ADD CONSTRAINT valid_borrow CHECK (
        (type = 'borrow' AND to_wallet_id IS NOT NULL AND to_fund_id IS NOT NULL) OR
        (type != 'borrow')
    ),
    ADD CONSTRAINT valid_collect CHECK (
        (type = 'collect' AND to_wallet_id IS NOT NULL AND to_fund_id IS NOT NULL) OR
        (type != 'collect')
    ),
    ADD CONSTRAINT valid_lend CHECK (
        (type = 'lend' AND from_wallet_id IS NOT NULL AND from_fund_id IS NOT NULL) OR
        (type != 'lend')
    ),
    ADD CONSTRAINT valid_repay CHECK (
        (type = 'repay' AND from_wallet_id IS NOT NULL AND from_fund_id IS NOT NULL) OR
        (type != 'repay')
    ),
    ADD CONSTRAINT valid_allocation CHECK (
        (type != 'allocation') OR
        (type = 'allocation' AND (
            (to_fund_id IS NOT NULL) OR 
            (related_transaction_id IS NOT NULL)
        ))
    );

-- Add constraints for numeric fields
ALTER TABLE machines
    ADD CONSTRAINT positive_un_allocated CHECK (un_allocated >= 0);

ALTER TABLE funds
    ADD CONSTRAINT positive_balance CHECK (balance >= 0),
    ADD CONSTRAINT valid_percent CHECK (percent >= 0 AND percent <= 100);

ALTER TABLE wallets
    ADD CONSTRAINT positive_balance CHECK (balance >= 0);

-- Create update timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create update timestamp triggers
CREATE TRIGGER update_machines_updated_at
    BEFORE UPDATE ON machines
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_machine_users_updated_at
    BEFORE UPDATE ON machine_users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stores_updated_at
    BEFORE UPDATE ON stores
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_funds_updated_at
    BEFORE UPDATE ON funds
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_wallets_updated_at
    BEFORE UPDATE ON wallets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at
    BEFORE UPDATE ON transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_machine_users_machine_id ON machine_users(machine_id);
CREATE INDEX idx_machine_users_user_id ON machine_users(user_id);
CREATE INDEX idx_stores_machine_id ON stores(machine_id);
CREATE INDEX idx_funds_machine_id ON funds(machine_id);
CREATE INDEX idx_funds_store_id ON funds(store_id);
CREATE INDEX idx_wallets_machine_id ON wallets(machine_id);
CREATE INDEX idx_transactions_machine_id ON transactions(machine_id);
CREATE INDEX idx_transactions_from_wallet_id ON transactions(from_wallet_id);
CREATE INDEX idx_transactions_to_wallet_id ON transactions(to_wallet_id);
CREATE INDEX idx_transactions_from_fund_id ON transactions(from_fund_id);
CREATE INDEX idx_transactions_to_fund_id ON transactions(to_fund_id);
CREATE INDEX idx_transactions_created_by ON transactions(created_by);

-- Add additional indexes for better query performance
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_created_at ON transactions(created_at);
CREATE INDEX idx_transactions_currency ON transactions(currency);
CREATE INDEX idx_transactions_category ON transactions(category);
CREATE INDEX idx_transactions_updated_by ON transactions(updated_by);
CREATE INDEX idx_transactions_related_transaction_id ON transactions(related_transaction_id);

-- Add indexes for reporting queries
CREATE INDEX idx_wallets_type ON wallets(type);
CREATE INDEX idx_wallets_currency ON wallets(currency);
CREATE INDEX idx_funds_store_id_machine_id ON funds(store_id, machine_id);
CREATE INDEX idx_stores_type_machine_id ON stores(type, machine_id);

-- Enable RLS
ALTER TABLE machines ENABLE ROW LEVEL SECURITY;
ALTER TABLE machine_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE machine_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE funds ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- First create machine_users basic policies
DROP POLICY IF EXISTS "Users can view their own memberships" ON machine_users;
CREATE POLICY "Users can view their own memberships"
    ON machine_users FOR SELECT
    USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Owners can create first user" ON machine_users;
CREATE POLICY "Owners can create first user"
    ON machine_users FOR INSERT
    WITH CHECK (true);

DROP POLICY IF EXISTS "Only owners can delete machine users" ON machine_users;
CREATE POLICY "Only owners can delete machine users"
    ON machine_users FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM machine_users owner
            WHERE owner.machine_id = machine_users.machine_id 
            AND owner.user_id = auth.uid() 
            AND owner.role = 'owner'
            AND owner.user_id != machine_users.user_id
        )
    );

-- Machines policies
DROP POLICY IF EXISTS "Users can view their machines" ON machines;
CREATE POLICY "Users can view their machines"
    ON machines FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM machine_users owner
            WHERE owner.machine_id = machines.id
            AND owner.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can create machines" ON machines;
CREATE POLICY "Users can create machines"
    ON machines FOR INSERT
    WITH CHECK (true);

DROP POLICY IF EXISTS "Only owners can update machines" ON machines;
CREATE POLICY "Only owners can update machines"
    ON machines FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM machine_users owner
            WHERE owner.machine_id = machines.id
            AND owner.user_id = auth.uid()
            AND owner.role = 'owner'
        )
    );

-- Machine invitations policies
DROP POLICY IF EXISTS "Users can view invitations for their email" ON machine_invitations;
CREATE POLICY "Users can view invitations for their email"
    ON machine_invitations FOR SELECT
    USING (
        invited_email = (SELECT email FROM auth.users WHERE id = auth.uid())
        OR EXISTS (
            SELECT 1 FROM machine_users owner
            WHERE owner.machine_id = machine_invitations.machine_id
            AND owner.user_id = auth.uid()
            AND owner.role = 'owner'
        )
    );

DROP POLICY IF EXISTS "Only owners can create invitations" ON machine_invitations;
CREATE POLICY "Only owners can create invitations"
    ON machine_invitations FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM machine_users owner
            WHERE owner.machine_id = machine_invitations.machine_id
            AND owner.user_id = auth.uid()
            AND owner.role = 'owner'
        )
    );

-- Stores policies
DROP POLICY IF EXISTS "Users can view their machine stores" ON stores;
CREATE POLICY "Users can view their machine stores"
    ON stores FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM machine_users member
            WHERE member.machine_id = stores.machine_id
            AND member.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can manage their machine stores" ON stores;
CREATE POLICY "Users can manage their machine stores"
    ON stores FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM machine_users member
            WHERE member.machine_id = stores.machine_id
            AND member.user_id = auth.uid()
        )
    );

-- Funds policies
DROP POLICY IF EXISTS "Users can view their machine funds" ON funds;
CREATE POLICY "Users can view their machine funds"
    ON funds FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM machine_users member
            WHERE member.machine_id = funds.machine_id
            AND member.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can manage their machine funds" ON funds;
CREATE POLICY "Users can manage their machine funds"
    ON funds FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM machine_users member
            WHERE member.machine_id = funds.machine_id
            AND member.user_id = auth.uid()
        )
    );

-- Wallets policies
DROP POLICY IF EXISTS "Users can view their machine wallets" ON wallets;
CREATE POLICY "Users can view their machine wallets"
    ON wallets FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM machine_users member
            WHERE member.machine_id = wallets.machine_id
            AND member.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can manage their machine wallets" ON wallets;
CREATE POLICY "Users can manage their machine wallets"
    ON wallets FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM machine_users member
            WHERE member.machine_id = wallets.machine_id
            AND member.user_id = auth.uid()
        )
    );

-- Transactions policies
DROP POLICY IF EXISTS "Users can view their machine transactions" ON transactions;
CREATE POLICY "Users can view their machine transactions"
    ON transactions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM machine_users member
            WHERE member.machine_id = transactions.machine_id
            AND member.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can manage their machine transactions" ON transactions;
CREATE POLICY "Users can manage their machine transactions"
    ON transactions FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM machine_users member
            WHERE member.machine_id = transactions.machine_id
            AND member.user_id = auth.uid()
        )
    );
