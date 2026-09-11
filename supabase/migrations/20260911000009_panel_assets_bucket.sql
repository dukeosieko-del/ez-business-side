-- Create bucket for panel assets (logos, favicons)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'panel-assets',
  'panel-assets',
  true,
  2097152,
  ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) DO NOTHING;

-- Public read policy
CREATE POLICY "Public can view panel assets"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'panel-assets');

-- Authenticated partner write policy
CREATE POLICY "Partners can upload panel assets"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'panel-assets'
    AND auth.uid() IS NOT NULL
  );
