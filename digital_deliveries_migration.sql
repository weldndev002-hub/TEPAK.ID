-- Create digital_deliveries table for tokenized URL access control
CREATE TABLE IF NOT EXISTS digital_deliveries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    token TEXT NOT NULL UNIQUE,
    file_url TEXT NOT NULL,
    signed_url TEXT,
    expires_at TIMESTAMPTZ NOT NULL,
    accessed_email TEXT NOT NULL,
    access_count INTEGER DEFAULT 0,
    last_accessed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for fast token lookups
CREATE INDEX idx_digital_deliveries_token ON digital_deliveries(token);
CREATE INDEX idx_digital_deliveries_order_id ON digital_deliveries(order_id);
CREATE INDEX idx_digital_deliveries_expires_at ON digital_deliveries(expires_at);

-- Add RLS policies
ALTER TABLE digital_deliveries ENABLE ROW LEVEL SECURITY;

-- Policy: merchants can view deliveries for their own products
CREATE POLICY "Merchants can view their own digital deliveries" ON digital_deliveries
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM orders o
            JOIN products p ON o.product_id = p.id
            WHERE o.id = digital_deliveries.order_id
            AND p.merchant_id = auth.uid()
        )
    );

-- Policy: system can insert/update (service role)
CREATE POLICY "Service role can manage digital deliveries" ON digital_deliveries
    FOR ALL USING (auth.role() = 'service_role');

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_digital_deliveries_updated_at
    BEFORE UPDATE ON digital_deliveries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();