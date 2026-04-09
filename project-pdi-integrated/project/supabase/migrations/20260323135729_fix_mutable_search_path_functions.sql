/*
  # Fix mutable search_path on database functions

  1. Modified Functions
    - `public.update_updated_at` - Added explicit search_path to prevent mutable path vulnerability
    - `public.handle_new_user` - Added explicit search_path to prevent mutable path vulnerability

  2. Security
    - Both functions now set `search_path = ''` which pins the search path
    - All table/schema references within the functions use explicit schema qualifiers where needed
    - This prevents potential search_path manipulation attacks

  3. Important Notes
    - `handle_new_user` retains SECURITY DEFINER as it needs to write to the profiles table
    - `update_updated_at` is a simple trigger function that only modifies NEW record fields
    - Existing triggers remain intact as we use CREATE OR REPLACE
*/

CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = '';

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  viewer_role_id uuid;
BEGIN
  SELECT id INTO viewer_role_id FROM public.roles WHERE name = 'viewer' LIMIT 1;

  INSERT INTO public.profiles (id, email, full_name, role_id)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    viewer_role_id
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = '';