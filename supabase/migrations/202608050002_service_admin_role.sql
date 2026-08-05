-- Service administrators are provisioned by trusted operators, never public sign-up.
alter type public.user_role add value if not exists 'service_admin';

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
declare
  requested_role text;
begin
  requested_role := coalesce(nullif(new.raw_user_meta_data ->> 'role', ''), 'instructor');
  if requested_role not in ('instructor', 'company_member') then
    raise exception 'Invalid product role';
  end if;

  insert into public.user_profiles (user_id, full_name, role)
  values (
    new.id,
    coalesce(
      nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''),
      split_part(new.email, '@', 1)
    ),
    requested_role::public.user_role
  );
  return new;
end;
$$;
