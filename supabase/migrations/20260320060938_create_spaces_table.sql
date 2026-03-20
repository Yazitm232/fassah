/*
  # Create Prayer Spaces Table

  1. New Tables
    - `spaces`
      - `id` (uuid, primary key) - Unique identifier for each prayer space
      - `name` (text) - Name of the prayer space location
      - `address` (text) - Full address of the location
      - `latitude` (decimal) - Latitude coordinate for map positioning
      - `longitude` (decimal) - Longitude coordinate for map positioning
      - `type` (text) - Type of space (Outdoor Space, Multi-faith Room, Friendly Business, Community Home, Other)
      - `description` (text) - Description of what to expect
      - `best_times` (text) - Recommended times to visit
      - `qibla_notes` (text) - Qibla direction guidance
      - `photo_url` (text, nullable) - URL to uploaded photo
      - `last_checkin` (timestamptz, nullable) - Last check-in timestamp
      - `created_at` (timestamptz) - Creation timestamp
      - `verified` (boolean) - Whether space is verified for display
  
  2. Security
    - Enable RLS on `spaces` table
    - Add policy for anyone to read verified spaces
    - Add policy for anyone to insert new spaces (will be unverified by default)
    - Add policy for anyone to update last_checkin on existing spaces
*/

CREATE TABLE IF NOT EXISTS spaces (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  address text NOT NULL,
  latitude decimal(10, 8) NOT NULL,
  longitude decimal(11, 8) NOT NULL,
  type text NOT NULL,
  description text NOT NULL,
  best_times text DEFAULT '',
  qibla_notes text DEFAULT '',
  photo_url text,
  last_checkin timestamptz,
  created_at timestamptz DEFAULT now(),
  verified boolean DEFAULT false
);

ALTER TABLE spaces ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read verified spaces"
  ON spaces
  FOR SELECT
  USING (verified = true);

CREATE POLICY "Anyone can insert new spaces"
  ON spaces
  FOR INSERT
  WITH CHECK (verified = false);

CREATE POLICY "Anyone can check in to spaces"
  ON spaces
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_spaces_verified ON spaces(verified);
CREATE INDEX IF NOT EXISTS idx_spaces_location ON spaces(latitude, longitude);