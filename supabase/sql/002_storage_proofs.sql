-- Create a public 'proofs' bucket (id = 'proofs') if it doesn't exist
do $$
begin
  if not exists (select 1 from storage.buckets where id = 'proofs') then
    insert into storage.buckets (id, name, public)
    values ('proofs', 'proofs', true);
  end if;
end $$;

-- Allow public READ access to objects in the 'proofs' bucket
create policy if not exists "proofs_public_read"
  on storage.objects
  for select
  using (bucket_id = 'proofs');

-- Allow anyone (anon or authenticated) to INSERT into 'proofs' bucket
create policy if not exists "proofs_public_insert"
  on storage.objects
  for insert
  with check (bucket_id = 'proofs');

-- Restrict DELETE to admin only (by email), scoped to the 'proofs' bucket
create policy if not exists "proofs_admin_delete"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'proofs'
    and lower(auth.jwt() ->> 'email') = 'uthmanajanaku@gmail.com'
  );

-- Optional: Restrict UPDATE to admin to prevent arbitrary overwrites
create policy if not exists "proofs_admin_update"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'proofs'
    and lower(auth.jwt() ->> 'email') = 'uthmanajanaku@gmail.com'
  )
  with check (
    bucket_id = 'proofs'
    and lower(auth.jwt() ->> 'email') = 'uthmanajanaku@gmail.com'
  );

