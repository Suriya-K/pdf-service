interface DcvHealth {
  code: string
  category: string
  group: string
  name_disease: string
  important: number
  urgent: number
  disease_score: number
  supplement: string
  intro: string
  checkup: string
  risk_reduction: string
  sex_exclude: string
}

interface DcvHealthLists {
  code?: string
  score?: string
}

interface HealthScore {
  sample?: Input
  score_lists?: DcvHealthLists[]
}

interface Input {
  sample_number: string
  sex: string
  sample_perc: number
}
