CREATE TABLE IF NOT EXISTS target_secrets (
    id BIGSERIAL PRIMARY KEY,
    target_id BIGINT NOT NULL,
    secret_key VARCHAR(255) NOT NULL,
    encrypted_value TEXT NOT NULL,
    masked_value VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_target_secrets_target FOREIGN KEY (target_id) REFERENCES targets (id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_target_secrets_target_id ON target_secrets(target_id);
