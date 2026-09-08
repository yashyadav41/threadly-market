import { supabase } from './supabase';

export interface SellerApplication {
  id: string;
  user_id: string;
  business_name: string;
  owner_name: string;
  email: string;
  phone: string;
  description: string;
  category: string;
  address: string;
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  created_at: string;
}

export interface ApplicationInput {
  business_name: string;
  owner_name: string;
  email: string;
  phone: string;
  description: string;
  category: string;
  address: string;
}

/** The current user's most recent seller application, if any. */
export async function fetchMyApplication(userId: string): Promise<SellerApplication | null> {
  const { data, error } = await supabase
    .from('seller_applications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('fetchMyApplication failed:', error.message);
    return null;
  }
  return data;
}

export async function submitApplication(userId: string, input: ApplicationInput): Promise<void> {
  const { error } = await supabase.from('seller_applications').insert({ user_id: userId, ...input });
  if (error) throw new Error(error.message);
}

/** Admin-only: every application on the platform. */
export async function fetchAllApplications(): Promise<SellerApplication[]> {
  const { data, error } = await supabase
    .from('seller_applications')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('fetchAllApplications failed:', error.message);
    return [];
  }
  return data ?? [];
}

/**
 * Admin action: approves an application, creates (or reactivates) the
 * seller's storefront row, and promotes their account role to 'seller'.
 */
export async function approveApplication(app: SellerApplication): Promise<void> {
  const { error: appError } = await supabase
    .from('seller_applications')
    .update({ status: 'approved' })
    .eq('id', app.id);
  if (appError) throw new Error(appError.message);

  const { error: sellerError } = await supabase
    .from('sellers')
    .upsert(
      { user_id: app.user_id, business_name: app.business_name, description: app.description, status: 'approved' },
      { onConflict: 'user_id' }
    );
  if (sellerError) throw new Error(sellerError.message);

  const { error: roleError } = await supabase
    .from('user_roles')
    .update({ role: 'seller' })
    .eq('user_id', app.user_id);
  if (roleError) throw new Error(roleError.message);
}

export async function rejectApplication(appId: string): Promise<void> {
  const { error } = await supabase.from('seller_applications').update({ status: 'rejected' }).eq('id', appId);
  if (error) throw new Error(error.message);
}
