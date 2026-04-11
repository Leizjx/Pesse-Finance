-- Performance Indexes for Pesse Finance

-- Table: profiles
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(id);

-- Table: data_connections
-- Optimization for finding active connections for a user/provider
CREATE INDEX IF NOT EXISTS idx_data_connections_user_sync ON data_connections(user_id, provider, sync_status);
CREATE INDEX IF NOT EXISTS idx_data_connections_status ON data_connections(sync_status);

-- Table: transactions
-- Optimization for dashboard balances and filtering
CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON transactions(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_user_type ON transactions(user_id, type);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category);

-- Table: subscriptions
-- Optimization for deduplication and fetching
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_gmail_id ON subscriptions(user_id, gmail_msg_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);

-- Table: budgets
CREATE INDEX IF NOT EXISTS idx_budgets_user_id ON budgets(user_id);
