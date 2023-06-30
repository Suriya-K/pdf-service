interface Healths {
  name: string
  genders: string
  weight: number
  height: number
  bmi: number
  score: Score
  health_score: number
}

interface HealthStatistic {
  category: string
  code: string
  pc_normal: number
  pc_atten: number
  pc_extra: number
}

interface DnaStatistic {
  code: string
  disease: string
  disease_th: string
  checkup: string
  risk_reduction: string
}

interface Score {
  bmi_start?: number
  bmi_end?: number
  bmi_lesser?: number
  bmi_greater?: number
  activity_type: string
  sleep_duration_start?: number
  sleep_duration_end?: number
  sleep_duration_start2?: number
  sleep_duration_end2?: number
  sleep_duration_greater?: number
  sleep_duration_lesser?: number
  strees_degress: string
  smoking: string
  fruit_and_veggies: string
  alcohol_drinking: string
}
