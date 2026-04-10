const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json',
    },
  });

const getEnv = (key: string) => process.env[key]?.trim() || '';

const getSupabaseUrl = () => getEnv('SUPABASE_URL') || getEnv('VITE_SUPABASE_URL') || getEnv('VITE_SUPABASE_DATABASE_URL');
const getSupabaseAnonKey = () => getEnv('SUPABASE_ANON_KEY') || getEnv('VITE_SUPABASE_ANON_KEY');
const getSupabaseServiceKey = () => getEnv('SUPABASE_SERVICE_ROLE_KEY');

const isAdminRole = (role: { name?: string | null; display_name?: string | null } | null | undefined) => {
  const roleText = `${role?.name || ''} ${role?.display_name || ''}`.toLowerCase();
  return roleText.includes('admin');
};

const createSupabaseHeaders = (apiKey: string, authToken: string) => ({
  apikey: apiKey,
  Authorization: `Bearer ${authToken}`,
  'content-type': 'application/json',
});

const parseAuthToken = (authHeader: string | null) => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  return authHeader.slice('Bearer '.length).trim() || null;
};

export default async (req: Request) => {
  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed.' }, 405);
  }

  const supabaseUrl = getSupabaseUrl();
  const supabaseServiceKey = getSupabaseServiceKey();
  const supabaseAnonKey = getSupabaseAnonKey() || supabaseServiceKey;

  if (!supabaseUrl || !supabaseServiceKey || !supabaseAnonKey) {
    return json({ error: 'Supabase environment variables are not configured for admin user creation.' }, 500);
  }

  const callerToken = parseAuthToken(req.headers.get('authorization'));
  if (!callerToken) {
    return json({ error: 'Missing authorization token.' }, 401);
  }

  let payload: {
    email?: string;
    password?: string;
    fullName?: string;
    organisation?: string;
    phone?: string;
  };

  try {
    payload = await req.json();
  } catch {
    return json({ error: 'Invalid JSON payload.' }, 400);
  }

  const email = payload.email?.trim().toLowerCase();
  const password = payload.password?.trim();
  const fullName = payload.fullName?.trim() || '';
  const organisation = payload.organisation?.trim() || '';
  const phone = payload.phone?.trim() || '';

  if (!email || !password || password.length < 8) {
    return json({ error: 'Email and password (minimum 8 characters) are required.' }, 400);
  }

  const callerResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
    method: 'GET',
    headers: createSupabaseHeaders(supabaseAnonKey, callerToken),
  });

  if (!callerResponse.ok) {
    return json({ error: 'Invalid session token.' }, 401);
  }

  const callerData = (await callerResponse.json()) as { id?: string };
  const callerId = callerData.id;

  if (!callerId) {
    return json({ error: 'Unable to resolve caller profile.' }, 401);
  }

  const callerProfileResponse = await fetch(
    `${supabaseUrl}/rest/v1/profiles?select=id,roles(name,display_name)&id=eq.${encodeURIComponent(callerId)}&limit=1`,
    {
      method: 'GET',
      headers: createSupabaseHeaders(supabaseAnonKey, callerToken),
    }
  );

  if (!callerProfileResponse.ok) {
    return json({ error: 'Unable to verify caller permissions.' }, 403);
  }

  const callerProfiles = (await callerProfileResponse.json()) as Array<{ roles?: { name?: string; display_name?: string } | null }>;
  const callerRole = callerProfiles[0]?.roles;

  if (!isAdminRole(callerRole)) {
    return json({ error: 'Only admin users can create admin users.' }, 403);
  }

  const roleResponse = await fetch(
    `${supabaseUrl}/rest/v1/roles?select=id,name,display_name&or=(name.ilike.*admin*,display_name.ilike.*admin*)&order=display_name.asc&limit=1`,
    {
      method: 'GET',
      headers: createSupabaseHeaders(supabaseServiceKey, supabaseServiceKey),
    }
  );

  if (!roleResponse.ok) {
    return json({ error: 'Admin role lookup failed.' }, 500);
  }

  const roles = (await roleResponse.json()) as Array<{ id: string }>;
  const adminRoleId = roles[0]?.id;

  if (!adminRoleId) {
    return json({ error: 'Admin role was not found.' }, 500);
  }

  const createUserResponse = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
    method: 'POST',
    headers: createSupabaseHeaders(supabaseServiceKey, supabaseServiceKey),
    body: JSON.stringify({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
      },
    }),
  });

  const createUserBody = await createUserResponse.json().catch(() => ({})) as {
    id?: string;
    user?: { id?: string; email?: string };
    msg?: string;
    message?: string;
  };

  if (!createUserResponse.ok) {
    const message = createUserBody.msg || createUserBody.message || 'Failed to create admin user.';
    return json({ error: message }, createUserResponse.status);
  }

  const newUserId = createUserBody.user?.id || createUserBody.id;
  if (!newUserId) {
    return json({ error: 'User was created but no user id was returned.' }, 500);
  }

  const profileUpdateResponse = await fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${encodeURIComponent(newUserId)}`, {
    method: 'PATCH',
    headers: {
      ...createSupabaseHeaders(supabaseServiceKey, supabaseServiceKey),
      Prefer: 'return=representation',
    },
    body: JSON.stringify({
      role_id: adminRoleId,
      full_name: fullName,
      organisation,
      phone,
      is_active: true,
    }),
  });

  if (!profileUpdateResponse.ok) {
    return json({ error: 'User account was created, but assigning the admin role failed.' }, 500);
  }

  return json({
    message: 'Admin user created successfully.',
    user: {
      id: newUserId,
      email,
    },
  });
};
