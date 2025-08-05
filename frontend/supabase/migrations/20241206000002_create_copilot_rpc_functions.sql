
-- RPC function to get code suggestions
CREATE OR REPLACE FUNCTION get_code_suggestions(p_user_id UUID)
RETURNS TABLE (
  id UUID,
  suggestion_type TEXT,
  suggestion_data JSONB,
  status TEXT,
  confidence_score DECIMAL(3,2),
  created_at TIMESTAMP WITH TIME ZONE,
  user_feedback TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cs.id,
    cs.suggestion_type,
    cs.suggestion_data,
    cs.status,
    cs.confidence_score,
    cs.created_at,
    cs.user_feedback
  FROM public.code_suggestions cs
  WHERE cs.user_id = p_user_id
  ORDER BY cs.created_at DESC
  LIMIT 20;
END;
$$;

-- RPC function to update code suggestion status
CREATE OR REPLACE FUNCTION update_code_suggestion(
  p_suggestion_id UUID,
  p_status TEXT,
  p_user_feedback TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.code_suggestions
  SET 
    status = p_status,
    user_feedback = p_user_feedback,
    applied_at = CASE WHEN p_status = 'applied' THEN NOW() ELSE applied_at END
  WHERE id = p_suggestion_id;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_code_suggestions(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION update_code_suggestion(UUID, TEXT, TEXT) TO authenticated;
