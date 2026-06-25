-- Create the journal_entries table
CREATE TABLE journal_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  user_id UUID DEFAULT '00000000-0000-0000-0000-000000000000'::UUID
);

-- Enable RLS
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;

-- Allow all operations for now (replace with proper auth check later)
CREATE POLICY "Allow all operations" 
  ON journal_entries 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);
