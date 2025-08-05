
-- Module 8: Analytics & Monitoring - Datenanalyse

-- Performance-Metriken
CREATE TABLE performance_metrics (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id),
  workflow_id uuid REFERENCES workflows(id),
  metric_type text, -- 'execution_time', 'cost', 'success_rate', 'token_usage'
  metric_value decimal(10,4),
  measurement_time timestamp with time zone DEFAULT now(),
  metadata jsonb
);

-- Custom Dashboards
CREATE TABLE custom_dashboards (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id),
  name text NOT NULL,
  description text,
  dashboard_config jsonb, -- Widget-Konfiguration
  is_shared boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Dashboard Widgets
CREATE TABLE dashboard_widgets (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  dashboard_id uuid REFERENCES custom_dashboards(id) ON DELETE CASCADE,
  widget_type text, -- 'metric', 'chart', 'table', 'alert'
  widget_config jsonb,
  position_x integer DEFAULT 0,
  position_y integer DEFAULT 0,
  width integer DEFAULT 4,
  height integer DEFAULT 3,
  created_at timestamp with time zone DEFAULT now()
);

-- Alerts
CREATE TABLE performance_alerts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id),
  alert_type text, -- 'cost_threshold', 'error_rate', 'performance_degradation'
  condition_config jsonb,
  is_active boolean DEFAULT true,
  last_triggered timestamp with time zone,
  notification_config jsonb, -- email, webhook, etc.
  created_at timestamp with time zone DEFAULT now()
);

-- Alert Triggers
CREATE TABLE alert_triggers (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  alert_id uuid REFERENCES performance_alerts(id) ON DELETE CASCADE,
  triggered_at timestamp with time zone DEFAULT now(),
  trigger_value jsonb,
  is_resolved boolean DEFAULT false,
  resolved_at timestamp with time zone
);

-- A/B Tests
CREATE TABLE ab_tests (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id),
  test_name text NOT NULL,
  workflow_a_id uuid REFERENCES workflows(id),
  workflow_b_id uuid REFERENCES workflows(id),
  traffic_split decimal(3,2) DEFAULT 0.5,
  status text DEFAULT 'running', -- 'planning', 'running', 'completed', 'paused'
  test_config jsonb,
  results jsonb,
  created_at timestamp with time zone DEFAULT now(),
  started_at timestamp with time zone,
  ended_at timestamp with time zone
);

-- A/B Test Executions
CREATE TABLE ab_test_executions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  test_id uuid REFERENCES ab_tests(id) ON DELETE CASCADE,
  variant text, -- 'a' or 'b'
  execution_data jsonb,
  execution_time timestamp with time zone DEFAULT now()
);

-- RLS Policies
ALTER TABLE performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_dashboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_widgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_triggers ENABLE ROW LEVEL SECURITY;
ALTER TABLE ab_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE ab_test_executions ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY "Users can manage their own metrics" ON performance_metrics
FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own dashboards" ON custom_dashboards
FOR ALL USING (auth.uid() = user_id OR is_shared = true);

CREATE POLICY "Dashboard widgets follow dashboard permissions" ON dashboard_widgets
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM custom_dashboards 
    WHERE id = dashboard_widgets.dashboard_id 
    AND (user_id = auth.uid() OR is_shared = true)
  )
);

CREATE POLICY "Users can manage their own alerts" ON performance_alerts
FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Alert triggers follow alert permissions" ON alert_triggers
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM performance_alerts 
    WHERE id = alert_triggers.alert_id 
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can manage their own A/B tests" ON ab_tests
FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "A/B test executions follow test permissions" ON ab_test_executions
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM ab_tests 
    WHERE id = ab_test_executions.test_id 
    AND user_id = auth.uid()
  )
);

-- Indexes for performance
CREATE INDEX idx_performance_metrics_user_workflow ON performance_metrics(user_id, workflow_id);
CREATE INDEX idx_performance_metrics_time ON performance_metrics(measurement_time);
CREATE INDEX idx_dashboard_widgets_dashboard ON dashboard_widgets(dashboard_id);
CREATE INDEX idx_alert_triggers_alert ON alert_triggers(alert_id);
CREATE INDEX idx_ab_test_executions_test ON ab_test_executions(test_id);

-- Functions for analytics aggregation
CREATE OR REPLACE FUNCTION get_workflow_metrics(
  p_user_id uuid,
  p_workflow_id uuid DEFAULT NULL,
  p_start_date timestamp with time zone DEFAULT now() - interval '30 days',
  p_end_date timestamp with time zone DEFAULT now()
)
RETURNS TABLE (
  metric_type text,
  avg_value numeric,
  min_value numeric,
  max_value numeric,
  total_measurements bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pm.metric_type,
    AVG(pm.metric_value) as avg_value,
    MIN(pm.metric_value) as min_value,
    MAX(pm.metric_value) as max_value,
    COUNT(*) as total_measurements
  FROM performance_metrics pm
  WHERE pm.user_id = p_user_id
    AND (p_workflow_id IS NULL OR pm.workflow_id = p_workflow_id)
    AND pm.measurement_time BETWEEN p_start_date AND p_end_date
  GROUP BY pm.metric_type
  ORDER BY pm.metric_type;
END;
$$;

-- Function to check alert conditions
CREATE OR REPLACE FUNCTION check_alert_conditions()
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  alert_record record;
  metric_value numeric;
  should_trigger boolean;
BEGIN
  FOR alert_record IN 
    SELECT * FROM performance_alerts WHERE is_active = true
  LOOP
    should_trigger := false;
    
    -- Simple threshold check (extend for more complex conditions)
    IF alert_record.alert_type = 'cost_threshold' THEN
      SELECT AVG(metric_value) INTO metric_value
      FROM performance_metrics
      WHERE user_id = alert_record.user_id
        AND metric_type = 'cost'
        AND measurement_time > now() - interval '1 hour';
      
      IF metric_value > (alert_record.condition_config->>'threshold')::numeric THEN
        should_trigger := true;
      END IF;
    END IF;
    
    -- Insert alert trigger if conditions are met
    IF should_trigger AND (
      alert_record.last_triggered IS NULL OR 
      alert_record.last_triggered < now() - interval '1 hour'
    ) THEN
      INSERT INTO alert_triggers (alert_id, trigger_value)
      VALUES (alert_record.id, jsonb_build_object('value', metric_value));
      
      UPDATE performance_alerts
      SET last_triggered = now()
      WHERE id = alert_record.id;
    END IF;
  END LOOP;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_workflow_metrics(uuid, uuid, timestamp with time zone, timestamp with time zone) TO authenticated;
GRANT EXECUTE ON FUNCTION check_alert_conditions() TO authenticated;
