
export interface PerformanceMetric {
  id: string;
  user_id: string;
  workflow_id?: string;
  metric_type: 'execution_time' | 'cost' | 'success_rate' | 'token_usage' | 'error_rate';
  metric_value: number;
  measurement_time: string;
  metadata?: any;
}

export interface CustomDashboard {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  dashboard_config: {
    layout: 'grid' | 'flex';
    theme: 'light' | 'dark';
    refresh_interval: number;
  };
  is_shared: boolean;
  created_at: string;
  updated_at: string;
  widgets?: DashboardWidget[];
}

export interface DashboardWidget {
  id: string;
  dashboard_id: string;
  widget_type: 'metric' | 'chart' | 'table' | 'alert';
  widget_config: {
    title: string;
    metric_type?: string;
    chart_type?: 'line' | 'bar' | 'pie' | 'area';
    time_range?: '1h' | '24h' | '7d' | '30d';
    workflow_id?: string;
    color_scheme?: string;
  };
  position_x: number;
  position_y: number;
  width: number;
  height: number;
  created_at: string;
}

export interface PerformanceAlert {
  id: string;
  user_id: string;
  alert_type: 'cost_threshold' | 'error_rate' | 'performance_degradation' | 'usage_spike';
  condition_config: {
    threshold?: number;
    comparison?: 'greater_than' | 'less_than' | 'equals';
    time_window?: number;
    metric_type?: string;
  };
  is_active: boolean;
  last_triggered?: string;
  notification_config: {
    email?: boolean;
    webhook_url?: string;
    slack_channel?: string;
  };
  created_at: string;
  triggers?: AlertTrigger[];
}

export interface AlertTrigger {
  id: string;
  alert_id: string;
  triggered_at: string;
  trigger_value: any;
  is_resolved: boolean;
  resolved_at?: string;
}

export interface ABTest {
  id: string;
  user_id: string;
  test_name: string;
  workflow_a_id: string;
  workflow_b_id: string;
  traffic_split: number;
  status: 'planning' | 'running' | 'completed' | 'paused';
  test_config: {
    success_metric: string;
    minimum_sample_size: number;
    confidence_level: number;
    test_duration_days: number;
  };
  results?: {
    variant_a_performance: number;
    variant_b_performance: number;
    statistical_significance: number;
    winner?: 'a' | 'b' | 'inconclusive';
  };
  created_at: string;
  started_at?: string;
  ended_at?: string;
  executions?: ABTestExecution[];
}

export interface ABTestExecution {
  id: string;
  test_id: string;
  variant: 'a' | 'b';
  execution_data: any;
  execution_time: string;
}

export interface WorkflowMetricsSummary {
  metric_type: string;
  avg_value: number;
  min_value: number;
  max_value: number;
  total_measurements: number;
}

export interface AnalyticsFilters {
  timeRange: '1h' | '24h' | '7d' | '30d' | 'custom';
  startDate?: Date;
  endDate?: Date;
  workflowId?: string;
  metricTypes?: string[];
}

export interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    borderColor?: string;
    backgroundColor?: string;
    fill?: boolean;
  }>;
}
