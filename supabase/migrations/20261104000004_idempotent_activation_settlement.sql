create or replace function public.settle_activation_payment(
  p_checkout_id text,
  p_receipt text,
  p_amount numeric,
  p_phone text
) returns boolean
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_payment public.activation_payments%rowtype;
  v_expected_phone text;
  v_received_phone text;
begin
  select * into v_payment from public.activation_payments
  where mpesa_checkout_id = p_checkout_id for update;

  if not found then raise exception 'Activation payment not found'; end if;
  if v_payment.status = 'paid' then return false; end if;
  if v_payment.status <> 'pending' then raise exception 'Activation payment is not pending'; end if;
  if round(v_payment.amount, 2) <> round(p_amount, 2) then raise exception 'Activation amount mismatch'; end if;

  v_expected_phone := right(regexp_replace(v_payment.phone, '[^0-9]', '', 'g'), 9);
  v_received_phone := right(regexp_replace(p_phone, '[^0-9]', '', 'g'), 9);
  if v_expected_phone <> v_received_phone then raise exception 'Activation phone mismatch'; end if;
  if coalesce(trim(p_receipt), '') = '' then raise exception 'M-Pesa receipt is required'; end if;

  perform public.credit_wallet(v_payment.partner_id, v_payment.amount, 'activation', p_checkout_id,
    jsonb_build_object('mpesa_receipt', p_receipt));

  update public.partners set status = 'active', activation_paid_at = now(), activation_amount = v_payment.amount
  where id = v_payment.partner_id;
  update public.activation_payments set status = 'paid', mpesa_receipt = p_receipt, completed_at = now()
  where id = v_payment.id;
  return true;
end;
$$;

revoke all on function public.settle_activation_payment(text, text, numeric, text) from public, anon, authenticated;
grant execute on function public.settle_activation_payment(text, text, numeric, text) to service_role;
