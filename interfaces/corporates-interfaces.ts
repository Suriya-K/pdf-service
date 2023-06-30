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
  disease: string
  disease_th: string
  checkup: string
  risk_reduction: string
  health_statistic?: HealthStatistic
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
  bmi_percentage?: Array<BMI_Score>
}

interface BMI_Score {
  point: string
  count: number
}

interface DNA_BaseHealthData {
  highestRisk: DnaStatic[]
  resultTables: DnaStatic[]
}

interface HealthScoreCalculation {
  lifestyle_calculation: AverageHealths[]
  highest_unhealthy_lifestyle: LifestyleHealths[]
}
