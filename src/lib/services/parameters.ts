import { getSupabaseAdmin } from '@/lib/supabase/server';

export interface ServiceParameter {
  id: string;
  service_id: string;
  param_key: string;
  param_type: 'string' | 'number' | 'boolean' | 'enum' | 'json';
  param_value: unknown;
  is_required: boolean;
  display_order: number;
  label: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export async function listServiceParameters(serviceId: string): Promise<ServiceParameter[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('service_parameters')
    .select()
    .eq('service_id', serviceId)
    .order('display_order', { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as ServiceParameter[];
}

export async function getServiceParameter(id: string): Promise<ServiceParameter | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('service_parameters')
    .select()
    .eq('id', id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return (data as ServiceParameter) ?? null;
}

export async function upsertServiceParameter(input: {
  service_id: string;
  param_key: string;
  param_type: ServiceParameter['param_type'];
  param_value?: unknown;
  is_required?: boolean;
  display_order?: number;
  label?: string | null;
  description?: string | null;
}): Promise<ServiceParameter> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('service_parameters')
    .upsert({
      service_id: input.service_id,
      param_key: input.param_key,
      param_type: input.param_type,
      param_value: input.param_value ?? null,
      is_required: input.is_required ?? false,
      display_order: input.display_order ?? 0,
      label: input.label ?? null,
      description: input.description ?? null,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error || !data) throw new Error(error?.message || 'Failed to upsert service parameter');
  return data as ServiceParameter;
}

export async function deleteServiceParameter(id: string): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from('service_parameters').delete().eq('id', id);
  if (error) throw new Error(error.message);
}