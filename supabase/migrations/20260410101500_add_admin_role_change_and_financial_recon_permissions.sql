-- Restrict role changes and financial reconciliation writes to admin users.

CREATE OR REPLACE FUNCTION public.change_user_role(target_user_id uuid, new_role_id uuid)
RETURNS public.profiles
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  acting_user_is_admin boolean;
  updated_profile public.profiles;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles p
    JOIN public.roles r ON r.id = p.role_id
    WHERE p.id = auth.uid()
      AND (
        lower(r.name) LIKE '%admin%'
        OR lower(coalesce(r.display_name, '')) LIKE '%admin%'
      )
  ) INTO acting_user_is_admin;

  IF NOT acting_user_is_admin THEN
    RAISE EXCEPTION 'Only admin users can change roles.' USING ERRCODE = '42501';
  END IF;

  UPDATE public.profiles
  SET role_id = new_role_id,
      updated_at = now()
  WHERE id = target_user_id
  RETURNING * INTO updated_profile;

  IF updated_profile.id IS NULL THEN
    RAISE EXCEPTION 'Target user profile not found.' USING ERRCODE = 'P0002';
  END IF;

  RETURN updated_profile;
END;
$$;

GRANT EXECUTE ON FUNCTION public.change_user_role(uuid, uuid) TO authenticated;

DROP POLICY IF EXISTS "Authenticated users can write mistico revenue records" ON mistico_revenue_records;

CREATE POLICY "Admin users can write mistico revenue records"
  ON mistico_revenue_records FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.profiles p
      JOIN public.roles r ON r.id = p.role_id
      WHERE p.id = auth.uid()
        AND (
          lower(r.name) LIKE '%admin%'
          OR lower(coalesce(r.display_name, '')) LIKE '%admin%'
        )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.profiles p
      JOIN public.roles r ON r.id = p.role_id
      WHERE p.id = auth.uid()
        AND (
          lower(r.name) LIKE '%admin%'
          OR lower(coalesce(r.display_name, '')) LIKE '%admin%'
        )
    )
  );
