-- Add parentId column for parent-specific calendar/schedule views
ALTER TABLE parents ADD COLUMN IF NOT EXISTS parent_id VARCHAR(6);

-- Populate parent_id for existing parents with unique 6-digit IDs
DO $$
DECLARE
  parent_record RECORD;
  new_parent_id VARCHAR(6);
  id_exists BOOLEAN;
BEGIN
  FOR parent_record IN SELECT id FROM parents WHERE parent_id IS NULL
  LOOP
    LOOP
      new_parent_id := LPAD(FLOOR(RANDOM() * 900000 + 100000)::TEXT, 6, '0');
      SELECT EXISTS(SELECT 1 FROM parents WHERE parent_id = new_parent_id) INTO id_exists;
      EXIT WHEN NOT id_exists;
    END LOOP;
    UPDATE parents SET parent_id = new_parent_id WHERE id = parent_record.id;
  END LOOP;
END $$;

-- Add UNIQUE constraint if not exists (allows NULL for new parents until populated)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'parents_parent_id_unique'
  ) THEN
    ALTER TABLE parents ADD CONSTRAINT parents_parent_id_unique UNIQUE (parent_id);
  END IF;
END $$;
