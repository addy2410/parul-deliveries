
-- Enable REPLICA IDENTITY on orders table to support realtime
ALTER TABLE public.orders REPLICA IDENTITY FULL;

-- Add the orders table to the realtime publication
BEGIN;
  -- Check if the publication exists
  SELECT pg_catalog.has_publication_privilege('supabase_realtime', 'CREATE');

  -- Add the table to the publication
  ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
COMMIT;
