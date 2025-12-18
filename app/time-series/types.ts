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

export interface AnalysisRequestPayload {
  sequence_length: number
  stride: number
  test_size: number
  shuffle: boolean
  detection_method: string
  normalize?: string
}