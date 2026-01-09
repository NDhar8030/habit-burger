-- Add opacity column to completions table to store the visual opacity when a completion is created
-- This enables the gradient streak effect where each day's opacity is "locked in" at the time of completion

ALTER TABLE completions ADD COLUMN IF NOT EXISTS opacity REAL DEFAULT 0.1;

-- Update existing completions to have a default opacity of 1.0 (fully opaque)
-- This is a reasonable default for historical data
UPDATE completions SET opacity = 1.0 WHERE opacity IS NULL OR opacity = 0.1;

