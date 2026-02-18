-- Create a public 'proofs' bucket (id = 'proofs') if it doesn't exist
insert into storage.buckets (id, name, public)
values ('proofs', 'proofs', true)
on conflict (id) do nothing;

-- Allow public READ access to objects in the 'proofs' bucket (optional for DB access;
-- public buckets are readable via the CDN automatically)
drop policy if exists "proofs_public_read" on storage.objects;
create policy "proofs_public_read"
  on storage.objects
  for select
  to public
  using (bucket_id = 'proofs');

-- Allow anyone (anon or authenticated) to INSERT into 'proofs' bucket
drop policy if exists "proofs_public_insert" on storage.objects;
create policy "proofs_public_insert"
  on storage.objects
  for insert
  to public
  with check (bucket_id = 'proofs');

-- Restrict DELETE to admin only (by email), scoped to the 'proofs' bucket
drop policy if exists "proofs_admin_delete" on storage.objects;
create policy "proofs_admin_delete"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'proofs'
    and lower(auth.jwt() ->> 'email') = 'uthmanajanaku@gmail.com'
  );

-- Optional: Restrict UPDATE to admin to prevent arbitrary overwrites
drop policy if exists "proofs_admin_update" on storage.objects;
create policy "proofs_admin_update"
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
