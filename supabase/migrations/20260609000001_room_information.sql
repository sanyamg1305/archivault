ALTER TABLE rooms
  ADD COLUMN IF NOT EXISTS floor_area_sqft numeric,
  ADD COLUMN IF NOT EXISTS ceiling_height_ft numeric,
  ADD COLUMN IF NOT EXISTS room_type text,
  ADD COLUMN IF NOT EXISTS notes text;
