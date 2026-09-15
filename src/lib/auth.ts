import { supabase } from './supabase';

export type UserRole = 'customer' | 'seller' | 'admin';

export interface AuthProfile {
  id: string;
  email: string;
  fullName: string | null;
  role: UserRole;
}

export interface SignUpResult {
  /** 'confirmed' = signed in immediately. 'confirmation_required' = check email before logging in. */
  status: 'confirmed' | 'confirmation_required';
}

/**
 * Signs up a new user. Profile and role rows are created automatically
 * by the `handle_new_user` database trigger (fires on every new
 * auth.users row, regardless of email-confirmation state) — this
 * function no longer inserts them from the client, since there may be
 * no active session yet to satisfy the old RLS-gated inserts when
 * email confirmation is required.
 */
export async function signUp(email: string, password: string, fullName: string): Promise<SignUpResult> {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      emailRedirectTo: window.location.origin,
    },
  });

  if (error) throw error;
  if (!data.user) throw new Error('Sign up succeeded but no user was returned.');

  if (!data.session) {
    // Email confirmation is required on this project. This is a
    // successful signup, not a failure — the account (and its profile
    // and customer role, via the database trigger) already exists.
    return { status: 'confirmation_required' };
  }

  return { status: 'confirmed' };
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getCurrentProfile(): Promise<AuthProfile | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const [{ data: profile }, { data: roleRow }] = await Promise.all([
    supabase.from('profiles').select('display_name').eq('id', user.id).maybeSingle(),
    supabase.from('user_roles').select('role').eq('user_id', user.id).maybeSingle(),
  ]);

  return {
    id: user.id,
    email: user.email ?? '',
    fullName: profile?.display_name ?? null,
    role: (roleRow?.role as UserRole) ?? 'customer',
  };
}