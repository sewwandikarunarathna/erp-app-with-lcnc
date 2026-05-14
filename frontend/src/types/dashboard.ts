export interface ReportDefinition {
  id: string;
  name: string;
  description?: string;
  dataSource: string;
  sourceType: 'ENTITY' | 'FORM' | 'CUSTOM_SQL';
  columns: any[];
  filters?: any;
  grouping?: any;
  sorting?: any;
  chartConfig: any;
  shared: boolean;
  ownerId: string;
}

export interface DashboardWidget {
  id: string;
  reportId: string;
  widgetType: 'BAR_CHART' | 'LINE_CHART' | 'KPI_CARD' | 'TABLE' | 'PIE';
  title: string;
  config: any;
  position: { x: number; y: number; w: number; h: number };
  refreshSecs: number;
}

export interface Dashboard {
  id: string;
  name: string;
  ownerId: string;
  shared: boolean;
  isDefault: boolean;
  layout: any; // react-grid-layout format
  widgets: DashboardWidget[];
}
