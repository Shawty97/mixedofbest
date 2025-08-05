
-- Add missing columns to workflows table if they don't exist
ALTER TABLE public.workflows 
ADD COLUMN IF NOT EXISTS performance JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS execution_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_executed TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS average_execution_time INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS success_rate DECIMAL(5,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_cost DECIMAL(10,4) DEFAULT 0;

-- Create workflow_executions table for tracking performance
CREATE TABLE IF NOT EXISTS public.workflow_executions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    workflow_id UUID REFERENCES public.workflows(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('success', 'failed', 'running', 'cancelled')),
    execution_time INTEGER, -- in milliseconds
    token_count INTEGER DEFAULT 0,
    cost DECIMAL(10,4) DEFAULT 0,
    input_data JSONB DEFAULT '{}',
    output_data JSONB DEFAULT '{}',
    error_message TEXT,
    node_performances JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS on workflow_executions
ALTER TABLE public.workflow_executions ENABLE ROW LEVEL SECURITY;

-- Create policies for workflow_executions
CREATE POLICY "Users can view their own workflow executions" ON public.workflow_executions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own workflow executions" ON public.workflow_executions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own workflow executions" ON public.workflow_executions
    FOR UPDATE USING (auth.uid() = user_id);

-- Create function to update workflow statistics
CREATE OR REPLACE FUNCTION update_workflow_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Update workflow statistics when execution completes
    IF NEW.status = 'success' OR NEW.status = 'failed' THEN
        UPDATE public.workflows 
        SET 
            execution_count = (
                SELECT COUNT(*) 
                FROM public.workflow_executions 
                WHERE workflow_id = NEW.workflow_id 
                AND status IN ('success', 'failed')
            ),
            last_executed = NEW.completed_at,
            average_execution_time = (
                SELECT AVG(execution_time)::INTEGER 
                FROM public.workflow_executions 
                WHERE workflow_id = NEW.workflow_id 
                AND status = 'success' 
                AND execution_time IS NOT NULL
            ),
            success_rate = (
                SELECT 
                    CASE 
                        WHEN COUNT(*) = 0 THEN 0
                        ELSE (COUNT(*) FILTER (WHERE status = 'success') * 100.0 / COUNT(*))::DECIMAL(5,2)
                    END
                FROM public.workflow_executions 
                WHERE workflow_id = NEW.workflow_id 
                AND status IN ('success', 'failed')
            ),
            total_cost = (
                SELECT COALESCE(SUM(cost), 0) 
                FROM public.workflow_executions 
                WHERE workflow_id = NEW.workflow_id
            ),
            updated_at = NOW()
        WHERE id = NEW.workflow_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updating workflow stats
CREATE TRIGGER update_workflow_stats_trigger
    AFTER UPDATE ON public.workflow_executions
    FOR EACH ROW
    WHEN (OLD.status IS DISTINCT FROM NEW.status)
    EXECUTE FUNCTION update_workflow_stats();
