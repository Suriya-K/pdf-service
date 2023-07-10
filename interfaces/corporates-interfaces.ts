interface Healths {
  name: string
  gender: string
  age: number
  weight: number
  height: number
  bmi: number
  activity_type: string
  sleep_duration: string
  strees_degress: string
  smoking: string
  fruit_and_veggies: string
  alcohol_drinking: string
  health_score: number
}

interface AverageHealths {
  name: string
  point1: number
  point2: number
  point3: number
  point4: number
  point5: number
}

interface LifestyleHealths {
  name: string
  description: string
}

interface HealthStatistic {
  category: string
  code: string
  pc_normal: number
  pc_atten: number
  pc_extra: number
}

interface DnaStatic {
  code: string
  disease?: string
  disease_th?: string
  checkup?: string
  risk_reduction?: string
  health_statistic?: HealthStatistic
}

interface Score {
  bmi: Array<CountScore>
  activity_type: Array<CountScore>
  sleep_duration_start: Array<CountScore>
  sleep_duration_end: Array<CountScore>
  strees_degress: Array<CountScore>
  smoking: Array<CountScore>
  fruit_and_veggies: Array<CountScore>
  alcohol_drinking: Array<CountScore>
}

interface DemographicData {
  population: number
  male: number
  female: number
  average_age: number
  age_range_min: number
  age_range_max: number
  report_time: Date
  average_weight: number
  average_height: number
  average_bmi: number
  bmi_percentage?: Array<CountScore>
}

interface CountScore {
  point?: string
  count: number
}

interface HealthScoreCalculation {
  lifestyle_calculation: AverageHealths[]
  highest_unhealthy_lifestyle: LifestyleHealths[]
}

