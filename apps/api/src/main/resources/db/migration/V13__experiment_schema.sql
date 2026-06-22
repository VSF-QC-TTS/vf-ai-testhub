CREATE TYPE experiment_status AS ENUM ('DRAFT', 'RUNNING', 'COMPLETED', 'FAILED', 'CANCELLED');

CREATE TABLE experiments (
    id BIGSERIAL PRIMARY KEY,
    public_id UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
    project_id BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    dataset_id BIGINT NOT NULL REFERENCES datasets(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    run_mode run_mode NOT NULL DEFAULT 'FULL_DATASET',
    selected_case_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
    selected_section VARCHAR(500),
    include_llm_judge BOOLEAN NOT NULL DEFAULT TRUE,
    include_tool_expectations BOOLEAN NOT NULL DEFAULT TRUE,
    max_concurrency INTEGER NOT NULL DEFAULT 3,
    timeout_ms INTEGER NOT NULL DEFAULT 30000,
    retry_count INTEGER NOT NULL DEFAULT 0,
    status experiment_status NOT NULL DEFAULT 'DRAFT',
    created_by BIGINT NOT NULL REFERENCES users(id),
    started_at TIMESTAMPTZ,
    finished_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE experiment_variants (
    id BIGSERIAL PRIMARY KEY,
    public_id UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
    experiment_id BIGINT NOT NULL REFERENCES experiments(id) ON DELETE CASCADE,
    variant_key VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    target_id BIGINT NOT NULL REFERENCES targets(id),
    run_id BIGINT REFERENCES runs(id),
    runtime_options JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_experiment_variants_key UNIQUE (experiment_id, variant_key)
);

CREATE INDEX idx_experiments_project_id ON experiments(project_id);
CREATE INDEX idx_experiments_dataset_id ON experiments(dataset_id);
CREATE INDEX idx_experiments_status ON experiments(status);
CREATE INDEX idx_experiments_created_at ON experiments(created_at);
CREATE INDEX idx_experiment_variants_experiment ON experiment_variants(experiment_id);
CREATE INDEX idx_experiment_variants_target ON experiment_variants(target_id);
CREATE INDEX idx_experiment_variants_run ON experiment_variants(run_id);
