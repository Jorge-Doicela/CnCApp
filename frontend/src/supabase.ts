import { environment } from "./environments/environment";

// Placeholder for Supabase client since we are migrating to custom backend
// This file can be eventually removed once all references are gone
export const supabase: any = {
  auth: {
    signInWithPassword: () => Promise.resolve({ error: { message: 'Use AuthService instead' } }),
    getSession: () => Promise.resolve({ data: { session: null }, error: null }),
    resetPasswordForEmail: () => Promise.resolve({ error: { message: 'Use AuthService' } }),
  },
  from: () => ({
    select: () => ({
      eq: () => ({
        single: () => Promise.resolve({ data: null, error: null })
      })
    })
  }),
  storage: {
    from: () => ({
      upload: () => Promise.resolve({ data: null, error: { message: 'Storage not implemented yet' } }),
      remove: () => Promise.resolve({ error: null })
    })
  }
};
