export interface ChartDataItem {
  date: string
  value: number
}

export interface ApiResponse {
  items: Array<{
    time: string
    value: number
  }>
}

export interface AnomalyRange {
  start: string // date string
  end: string // date string
  label?: string
}