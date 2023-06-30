import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Application from '@ioc:Adonis/Core/Application'
import csvtojson from 'csvtojson'
export default class CorporatesController {
  private health: Healths[]
  private health_report_statistic: HealthStatistic[]
  private dna_static: DnaStatic[]
  private demographic_data: DemographicData
  private score: { [key: number]: Score } = {
    1: {
      bmi_greater: 30,
      activity_type: 'sedentary',
      sleep_duration_lesser: 4,
      strees_degress: 'not at all',
      smoking: 'the chain-smoker',
      fruit_and_veggies: 'hardly',
      alcohol_drinking: 'always',
    },
    2: {
      bmi_start: 25.0,
      bmi_end: 29.9,
      activity_type: 'light activity',
      sleep_duration_start: 4,
      sleep_duration_end: 5,
      strees_degress: 'frequently',
      smoking: 'once a day',
      fruit_and_veggies: 'some',
      alcohol_drinking: 'the tippler',
    },
    3: {
      bmi_start: 23.0,
      bmi_end: 24.9,
      activity_type: 'moderate activity',
      sleep_duration_start: 5,
      sleep_duration_end: 6,
      sleep_duration_start2: 6,
      sleep_duration_end2: 7,
      strees_degress: 'sometimes',
      smoking: 'sometimes',
      fruit_and_veggies: 'not that much',
      alcohol_drinking: 'the lightweight',
    },
    4: {
      bmi_lesser: 18.5,
      activity_type: 'moderate-to-high activity',
      sleep_duration_start: 7,
      sleep_duration_end: 8,
      strees_degress: 'rarely-to-seldom',
      smoking: 'the smoke quitter',
      fruit_and_veggies: 'about half',
      alcohol_drinking: 'occasionally ',
    },
    5: {
      bmi_start: 18.5,
      bmi_end: 22.9,
      activity_type: 'high activity',
      sleep_duration_greater: 8,
      strees_degress: 'not at all',
      smoking: 'never smoke',
      fruit_and_veggies: 'half and more',
      alcohol_drinking: 'not at all',
    },
  }

  public async get({ response }: HttpContextContract) {
    this.health = await this.readInputCsv()
    this.health_report_statistic = await this.readHealthReportStatistic()
    this.dna_static = await this.readStaticDNA()
    await this.calculatDemographicData()
    return response.json({
      health: this.health,
      health_report_statistic: this.health_report_statistic,
      dna_static: this.dna_static,
      demographic_data: this.demographic_data,
    })
  }

  private async readInputCsv() {
    const path: string = Application.resourcesPath('/healthscore.csv')
    const selected_colunm: RegExp =
      /(name|gender|age|weight|height|bmi|activity_type|sleep_duration|stress_degree|smoking|fruit_and_veggies|alcohol_drinking|health_score)/
    const healths_inputs: Array<Healths> = await csvtojson({
      includeColumns: selected_colunm,
    }).fromFile(path)
    return healths_inputs
  }

  private async readHealthReportStatistic() {
    const path: string = Application.resourcesPath('/heath_report_statistic.csv')
    const selected_colunm: RegExp = /(category|code|pc_normal|pc_atten|pc_extra)/
    const health_report_statistic: Array<HealthStatistic> = await csvtojson({
      includeColumns: selected_colunm,
    }).fromFile(path)
    return health_report_statistic
  }

  private async readStaticDNA() {
    const path: string = Application.resourcesPath('/dna_static.csv')
    const selected_colunm: RegExp = /(code|disease|disease_th|checkup|risk_reduction)/
    const dna_static: Array<DnaStatic> = await csvtojson({
      includeColumns: selected_colunm,
    }).fromFile(path)
    return dna_static
  }

  private async calculatDemographicData() {
    if (!this.health) return

    this.demographic_data = {
      population: 0,
      male: 0,
      female: 0,
      average_age: 0,
      age_range_min: 0,
      age_range_max: 0,
      report_time: new Date(),
      average_weight: 0,
      average_height: 0,
      average_bmi: 0,
      bmi_percentage: [
        { point: 'ต่ํากว่าเกณฑ์', count: 0 },
        { point: 'สมส่วน', count: 0 },
        { point: 'น้ำหนักเกิน', count: 0 },
        { point: 'โรคอ้วน', count: 0 },
        { point: 'โรคอ้วนอัตราย', count: 0 },
      ],
    }

    this.health.forEach((h: Healths) => {
      this.demographic_data.population += 1
      if (h.gender === 'male') this.demographic_data.male += 1
      if (h.gender === 'female') this.demographic_data.female += 1
      this.demographic_data.age_range_min = Math.min(h.age)
      this.demographic_data.age_range_max = Math.max(h.age)
    })
    this.demographic_data.average_age = this.getAverage(this.health, 'age')
    this.demographic_data.average_weight = this.getAverage(this.health, 'weight')
    this.demographic_data.average_height = this.getAverage(this.health, 'height')
    this.demographic_data.average_bmi = this.getAverage(this.health, 'bmi')
    this.demographic_data.bmi_percentage = this.getPercentBMI()
  }

  private getPercentBMI() {
    if (!this.health) return

    let bmi_score: Array<BMI_Score> = [
      { point: 'ต่ํากว่าเกณฑ์', count: 0 },
      { point: 'สมส่วน', count: 0 },
      { point: 'น้ำหนักเกิน', count: 0 },
      { point: 'โรคอ้วน', count: 0 },
      { point: 'โรคอ้วนอัตราย', count: 0 },
    ]

    this.health.forEach((h: Healths) => {
      if (h.bmi < 18.5) return (bmi_score[0].count += 1)
      if (h.bmi >= 18.5 && h.bmi <= 22.9) return (bmi_score[1].count += 1)
      if (h.bmi >= 23.0 && h.bmi <= 24.9) return (bmi_score[2].count += 1)
      if (h.bmi >= 25.0 && h.bmi <= 29.9) return (bmi_score[3].count += 1)
      return (bmi_score[4].count += 1)
    })

    const total: number = bmi_score.reduce((sum, score) => sum + score.count, 0)
    const map_percent: Array<BMI_Score> = bmi_score.map((score: BMI_Score) => {
      const percentage: number = (score.count / total) * 100
      return {
        point: score.point,
        count: percentage,
      }
    })

    return map_percent
  }

  private getAverage(arr: Array<Healths>, key: string) {
    let sum: number = 0
    for (let i = 0; i < arr.length; i++) {
      sum += Number(arr[i][key])
    }
    return Math.round((sum / arr.length) * 100) / 100
  }
}
