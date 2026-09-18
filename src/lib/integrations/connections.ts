import { getSupabaseAdmin } from '@/lib/supabase/server';
import { encryptSecret, decryptSecret } from '../secrets';

export interface IntegrationConnection {
  id: string;
  partner_id: string;
  integration_type: string;
  display_name: string | null;
  is_active: boolean;
  config: Record<string, unknown>;
  last_tested_at: string | null;
  last_test_status: string | null;
  created_at: string;
  updated_at: string;
}

export async function listIntegrations(partnerId: string): Promise<IntegrationConnection[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('integration_connections')
    .select()
    .eq('partner_id', partnerId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as IntegrationConnection[];
}

export async function getIntegration(
  partnerId: string,
  integrationType: string
): Promise<IntegrationConnection | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('integration_connections')
    .select()
    .eq('partner_id', partnerId)
    .eq('integration_type', integrationType)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return (data as IntegrationConnection) ?? null;
}

export async function upsertIntegration(input: {
  partner_id: string;
  integration_type: string;
  display_name?: string | null;
  is_active?: boolean;
  config?: Record<string, unknown>;
  credentials?: Record<string, string>;
}): Promise<IntegrationConnection> {
  const supabase = getSupabaseAdmin();

  // Encrypt any credential fields before persisting.
  // Secrets are stored as "enc:<base64>" blobs — never plaintext.
  let config = input.config ?? {};
  if (input.credentials && Object.keys(input.credentials).length > 0) {
    config = { ...config, _credentials: await encryptSecret(JSON.stringify(input.credentials)) };
  }

  const { data, error } = await supabase
    .from('integration_connections')
    .upsert({
      partner_id: input.partner_id,
      integration_type: input.integration_type,
      display_name: input.display_name ?? null,
      is_active: input.is_active ?? true,
      config,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error || !data) throw new Error(error?.message || 'Failed to upsert integration');
  return data as IntegrationConnection;
}

export async function getIntegrationCredentials(
  connection: IntegrationConnection
): Promise<Record<string, string> | null> {
  const config = connection.config as Record<string, unknown>;
  const encrypted = config._credentials as string | undefined;
  if (!encrypted) return null;
  const raw = await decryptSecret(encrypted.replace(/^enc:/, ''));
  try {
    return JSON.parse(raw) as Record<string, string>;
  } catch {
    return null;
  }
}

export async function deleteIntegration(partnerId: string, integrationType: string): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from('integration_connections')
    .delete()
    .eq('partner_id', partnerId)
    .eq('integration_type', integrationType);
  if (error) throw new Error(error.message);
}