-- Maverick Capital Platform - Storage Buckets
-- Layer 1.4: Supabase Storage configuration
-- All objects prefixed with mc_ for easy identification

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('mc-avatars', 'mc-avatars', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('mc-signal-images', 'mc-signal-images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('mc-news-images', 'mc-news-images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('mc-kyc-documents', 'mc-kyc-documents', false, 20971520, ARRAY['image/jpeg', 'image/png', 'application/pdf']),
  ('mc-support-attachments', 'mc-support-attachments', false, 10485760, ARRAY['image/jpeg', 'image/png', 'application/pdf', 'text/plain']);

-- Storage policies for avatars (public read, authenticated write own)
CREATE POLICY "mc_avatar_images_publicly_accessible" ON storage.objects FOR SELECT USING (bucket_id = 'mc-avatars');
CREATE POLICY "mc_users_can_upload_own_avatar" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'mc-avatars' AND (storage.foldername(name))[1] = auth.uid()::text
);
CREATE POLICY "mc_users_can_update_own_avatar" ON storage.objects FOR UPDATE USING (
  bucket_id = 'mc-avatars' AND (storage.foldername(name))[1] = auth.uid()::text
);
CREATE POLICY "mc_users_can_delete_own_avatar" ON storage.objects FOR DELETE USING (
  bucket_id = 'mc-avatars' AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Storage policies for signal-images (public read, admin write)
CREATE POLICY "mc_signal_images_publicly_accessible" ON storage.objects FOR SELECT USING (bucket_id = 'mc-signal-images');
CREATE POLICY "mc_admins_can_upload_signal_images" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'mc-signal-images' AND EXISTS (
    SELECT 1 FROM mc_user_roles ur JOIN mc_roles r ON r.id = ur.role_id WHERE ur.user_id = auth.uid() AND r.name IN ('super_admin', 'admin', 'analyst')
  )
);
CREATE POLICY "mc_admins_can_update_signal_images" ON storage.objects FOR UPDATE USING (
  bucket_id = 'mc-signal-images' AND EXISTS (
    SELECT 1 FROM mc_user_roles ur JOIN mc_roles r ON r.id = ur.role_id WHERE ur.user_id = auth.uid() AND r.name IN ('super_admin', 'admin', 'analyst')
  )
);
CREATE POLICY "mc_admins_can_delete_signal_images" ON storage.objects FOR DELETE USING (
  bucket_id = 'mc-signal-images' AND EXISTS (
    SELECT 1 FROM mc_user_roles ur JOIN mc_roles r ON r.id = ur.role_id WHERE ur.user_id = auth.uid() AND r.name IN ('super_admin', 'admin')
  )
);

-- Storage policies for news-images (public read, admin write)
CREATE POLICY "mc_news_images_publicly_accessible" ON storage.objects FOR SELECT USING (bucket_id = 'mc-news-images');
CREATE POLICY "mc_admins_can_upload_news_images" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'mc-news-images' AND EXISTS (
    SELECT 1 FROM mc_user_roles ur JOIN mc_roles r ON r.id = ur.role_id WHERE ur.user_id = auth.uid() AND r.name IN ('super_admin', 'admin')
  )
);
CREATE POLICY "mc_admins_can_update_news_images" ON storage.objects FOR UPDATE USING (
  bucket_id = 'mc-news-images' AND EXISTS (
    SELECT 1 FROM mc_user_roles ur JOIN mc_roles r ON r.id = ur.role_id WHERE ur.user_id = auth.uid() AND r.name IN ('super_admin', 'admin')
  )
);
CREATE POLICY "mc_admins_can_delete_news_images" ON storage.objects FOR DELETE USING (
  bucket_id = 'mc-news-images' AND EXISTS (
    SELECT 1 FROM mc_user_roles ur JOIN mc_roles r ON r.id = ur.role_id WHERE ur.user_id = auth.uid() AND r.name IN ('super_admin', 'admin')
  )
);

-- Storage policies for kyc-documents (private, user own + admin read)
CREATE POLICY "mc_users_can_view_own_kyc_documents" ON storage.objects FOR SELECT USING (
  bucket_id = 'mc-kyc-documents' AND (storage.foldername(name))[1] = auth.uid()::text
);
CREATE POLICY "mc_users_can_upload_kyc_documents" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'mc-kyc-documents' AND (storage.foldername(name))[1] = auth.uid()::text
);
CREATE POLICY "mc_admins_can_view_all_kyc_documents" ON storage.objects FOR SELECT USING (
  bucket_id = 'mc-kyc-documents' AND EXISTS (
    SELECT 1 FROM mc_user_roles ur JOIN mc_roles r ON r.id = ur.role_id WHERE ur.user_id = auth.uid() AND r.name IN ('super_admin', 'admin')
  )
);

-- Storage policies for support-attachments (user own + support/admin read)
CREATE POLICY "mc_users_can_view_own_support_attachments" ON storage.objects FOR SELECT USING (
  bucket_id = 'mc-support-attachments' AND (storage.foldername(name))[1] = auth.uid()::text
);
CREATE POLICY "mc_users_can_upload_support_attachments" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'mc-support-attachments' AND (storage.foldername(name))[1] = auth.uid()::text
);
CREATE POLICY "mc_support_and_admins_can_view_all_attachments" ON storage.objects FOR SELECT USING (
  bucket_id = 'mc-support-attachments' AND EXISTS (
    SELECT 1 FROM mc_user_roles ur JOIN mc_roles r ON r.id = ur.role_id WHERE ur.user_id = auth.uid() AND r.name IN ('super_admin', 'admin', 'support')
  )
);
CREATE POLICY "mc_support_and_admins_can_upload_attachments" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'mc-support-attachments' AND EXISTS (
    SELECT 1 FROM mc_user_roles ur JOIN mc_roles r ON r.id = ur.role_id WHERE ur.user_id = auth.uid() AND r.name IN ('super_admin', 'admin', 'support')
  )
);
