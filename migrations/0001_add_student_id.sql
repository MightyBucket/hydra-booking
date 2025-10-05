
-- Add studentId column
ALTER TABLE students ADD COLUMN student_id VARCHAR(6);

-- Generate unique 6-digit IDs for existing students
DO $$
DECLARE
  student_record RECORD;
  new_student_id VARCHAR(6);
  id_exists BOOLEAN;
BEGIN
  FOR student_record IN SELECT id FROM students LOOP
    LOOP
      -- Generate random 6-digit number
      new_student_id := LPAD(FLOOR(RANDOM() * 900000 + 100000)::TEXT, 6, '0');
      
      -- Check if this ID already exists
      SELECT EXISTS(SELECT 1 FROM students WHERE student_id = new_student_id) INTO id_exists;
      
      -- If unique, use it
      IF NOT id_exists THEN
        UPDATE students SET student_id = new_student_id WHERE id = student_record.id;
        EXIT;
      END IF;
    END LOOP;
  END LOOP;
END $$;

-- Make studentId NOT NULL and UNIQUE after populating
ALTER TABLE students ALTER COLUMN student_id SET NOT NULL;
ALTER TABLE students ADD CONSTRAINT students_student_id_unique UNIQUE (student_id);
