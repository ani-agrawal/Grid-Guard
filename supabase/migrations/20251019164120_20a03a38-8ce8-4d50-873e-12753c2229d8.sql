-- Grant service role permissions to update risk_scores table
-- Allow the edge function to delete old scores and insert new ones

-- Create policy for service role to delete risk scores
CREATE POLICY "Service role can delete risk scores"
ON public.risk_scores
FOR DELETE
TO service_role
USING (true);

-- Create policy for service role to insert risk scores
CREATE POLICY "Service role can insert risk scores"
ON public.risk_scores
FOR INSERT
TO service_role
WITH CHECK (true);

-- Create policy for service role to update risk scores (if needed)
CREATE POLICY "Service role can update risk scores"
ON public.risk_scores
FOR UPDATE
TO service_role
USING (true)
WITH CHECK (true);