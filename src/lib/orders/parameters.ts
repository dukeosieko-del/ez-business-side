import { getSupabaseAdmin } from '@/lib/supabase/server';

export interface OrderParameter {
  id: string;
  order_id: string;
  param_key: string;
  param_value: unknown;
  created_at: string;
}

export async function listOrderParameters(orderId: string): Promise<OrderParameter[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('order_parameters')
    .select()
    .eq('order_id', orderId)
    .order('created_at', { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as OrderParameter[];
}

export async function createOrderParameters(
  orderId: string,
  params: Array<{ param_key: string; param_value: unknown }>
): Promise<OrderParameter[]> {
  if (params.length === 0) return [];

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('order_parameters')
    .insert(
      params.map((p) => ({
        order_id: orderId,
        param_key: p.param_key,
        param_value: p.param_value,
      }))
    )
    .select();

  if (error) throw new Error(error.message);
  return (data ?? []) as OrderParameter[];
}

export async function deleteOrderParameters(orderId: string): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from('order_parameters').delete().eq('order_id', orderId);
  if (error) throw new Error(error.message);
}