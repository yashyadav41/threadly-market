import { supabase } from './supabase';

export type UserRole = 'customer' | 'seller' | 'admin';

export interface AuthProfile {
  id: string;
  email: string;
  fullName: string | null;
  role: UserRole;
}

export async function signUp(email: string, password: string, fullName: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
    },
  });

  if (error) throw error;
  if (!data.user) throw new Error('Sign up succeeded but no user was returned.');

  const userId = data.user.id;

  const { error: profileError } = await supabase
    .from('profiles')
    .insert({ id: userId, display_name: fullName });
  if (profileError) throw profileError;

  const { error: roleError } = await supabase
    .from('user_roles')
    .insert({ user_id: userId, role: 'customer' });
  if (roleError) throw roleError;

  return data;
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