import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isDemoMode = !supabaseUrl || !supabaseAnonKey;

/**
 * Lightweight stub that satisfies the SupabaseClient interface enough for the
 * app to render without crashing when no Supabase credentials are configured.
 * Every query resolves to an empty result set.
 */
function createDemoClient(): SupabaseClient {
  const emptyResult = { data: [], error: null, count: null, status: 200, statusText: 'OK' };
  const singleResult = { data: null, error: null, count: null, status: 200, statusText: 'OK' };

  // Chainable query builder that always resolves to empty data.
  const queryBuilder = (): any => {
    const chain: any = new Proxy(
      {},
      {
        get(_target, prop) {
          // Terminal methods that return a promise
          if (prop === 'then' || prop === 'catch' || prop === 'finally') {
            const promise = Promise.resolve(emptyResult);
            return (promise as any)[prop].bind(promise);
          }
          if (prop === 'maybeSingle' || prop === 'single') {
            return () => Promise.resolve(singleResult);
          }
          // Everything else keeps chaining
          return (..._args: any[]) => chain;
        },
      },
    );
    return chain;
  };

  const noopChannel: any = new Proxy(
    {},
    {
      get() {
        return (..._args: any[]) => noopChannel;
      },
    },
  );

  const stub = {
    from: () => queryBuilder(),
    rpc: () => Promise.resolve(emptyResult),
    channel: () => noopChannel,
    removeChannel: () => {},
    storage: {
      from: () =>
        new Proxy(
          {},
          {
            get() {
              return (..._args: any[]) => Promise.resolve({ data: null, error: null });
            },
          },
        ),
    },
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signInWithPassword: () => Promise.resolve({ data: { user: null, session: null }, error: null }),
      signUp: () => Promise.resolve({ data: { user: null, session: null }, error: null }),
      signOut: () => Promise.resolve({ error: null }),
      resetPasswordForEmail: () => Promise.resolve({ error: null }),
    },
  };

  return stub as unknown as SupabaseClient;
}

export const supabase: SupabaseClient = isDemoMode
  ? createDemoClient()
  : createClient(supabaseUrl, supabaseAnonKey);
