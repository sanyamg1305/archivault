-- Add revision_note column to materials
ALTER TABLE materials ADD COLUMN revision_note text;

-- Add revision_note column to design_versions
ALTER TABLE design_versions ADD COLUMN revision_note text;
