import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Application from '@ioc:Adonis/Core/Application'
import csvtojson from 'csvtojson'
export default class CorporatesController {
  private healths: Array<Healths>
  private health_report_statistic: Array<HealthStatistic>
  private dna_static: Array<DnaStatic>
  private demographic_data: DemographicData
  private default_selected_code: Array<string> = [
    'BR001',
    'BR002',
    'CV001',
    'CV003',
    'CV004',
    'CV005',
    'DS001',
    'DS004',
    'DS007',
    'BR005',
  ]
  private selected_code: Array<string> = []

  public async get({ request, response }: HttpContextContract) {
    const { selected_code } = request.body()
    if (!selected_code) this.selected_code = this.default_selected_code

    await this.readInputCsv()
    await this.getSelectedHealthReportStatistic()
    await this.readStaticDNA()

    const top_three_health_risk = await this.getTopThreeHealthRisk()
    const dna_result_table = await this.getHighestHealthRisk()
    const lifestyle_calculation = await this.getHighestLifeStyle()

    await this.calculatDemographicData()
    return response.json({
      health: this.healths,
      health_report_statistic: this.health_report_statistic,
      dna_static: this.dna_static,
      demographic_data: this.demographic_data,
      top_three_health: top_three_health_risk,
      dna_result_table: dna_result_table,
      lifestyle_calculation: lifestyle_calculation,
    })
  }

  private async readInputCsv() {
    const path: string = Application.resourcesPath('/healthscore.csv')
    const selected_colunm: RegExp =
      /(name|gender|age|weight|height|bmi|activity_type|sleep_duration|stress_degree|smoking|fruit_and_veggies|alcohol_drinking|health_score)/
    const healths_inputs: Array<Healths> = await csvtojson({
      includeColumns: selected_colunm,
    }).fromFile(path)
    this.healths = healths_inputs
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
    this.dna_static = dna_static
  }

  private async getSelectedHealthReportStatistic() {
    const all_health_report_statistic = await this.readHealthReportStatistic()
    this.health_report_statistic = all_health_report_statistic.filter((health) =>
      this.selected_code.includes(health.code)
    )
  }

  private async calculatDemographicData() {
    if (!this.healths) return

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

    this.healths.forEach((h: Healths) => {
      this.demographic_data.population += 1
      if (h.gender === 'male') this.demographic_data.male += 1
      if (h.gender === 'female') this.demographic_data.female += 1
      this.demographic_data.age_range_min = Math.min(h.age)
      this.demographic_data.age_range_max = Math.max(h.age)
    })

    this.demographic_data.average_age = this.getAverage(this.healths, 'age')
    this.demographic_data.average_weight = this.getAverage(this.healths, 'weight')
    this.demographic_data.average_height = this.getAverage(this.healths, 'height')
    this.demographic_data.average_bmi = this.getAverage(this.healths, 'bmi')
    this.demographic_data.bmi_percentage = this.getPercentBMI()
  }

  private getPercentBMI() {
    if (!this.healths) return

    let bmi_score: Array<CountScore> = [
      { point: 'ต่ํากว่าเกณฑ์', count: 0 },
      { point: 'สมส่วน', count: 0 },
      { point: 'น้ำหนักเกิน', count: 0 },
      { point: 'โรคอ้วน', count: 0 },
      { point: 'โรคอ้วนอัตราย', count: 0 },
    ]

    this.healths.forEach((h: Healths) => {
      if (h.bmi < 18.5) return (bmi_score[0].count += 1)
      if (h.bmi >= 18.5 && h.bmi <= 22.9) return (bmi_score[1].count += 1)
      if (h.bmi >= 23.0 && h.bmi <= 24.9) return (bmi_score[2].count += 1)
      if (h.bmi >= 25.0 && h.bmi <= 29.9) return (bmi_score[3].count += 1)
      return (bmi_score[4].count += 1)
    })
    const bmi_percentage = this.calculateScorePercentage(bmi_score)
    return bmi_percentage
  }

  private getAverage(arr: Array<Healths>, key: string) {
    let sum: number = 0
    for (let i = 0; i < arr.length; i++) {
      sum += Number(arr[i][key])
    }
    return Math.round((sum / arr.length) * 100) / 100
  }

  private async getHighestHealthRisk() {
    if (!this.health_report_statistic && !this.dna_static) return []

    const sort_health_risk: Array<HealthStatistic> = this.health_report_statistic.sort(
      (health1, health2) => {
        const sorted_health1 = Math.max(health1.pc_extra, health1.pc_atten)
        const sorted_health2 = Math.max(health2.pc_extra, health2.pc_atten)
        return sorted_health2 - sorted_health1
      }
    )

    return sort_health_risk
  }

  private async getTopThreeHealthRisk() {
    const sort_health_risk: Array<HealthStatistic> = await this.getHighestHealthRisk()
    const top_three: Array<HealthStatistic> = sort_health_risk.slice(0, 3)
    let top_three_health_risk: Array<DnaStatic> = []
    for (const health of top_three) {
      const details = this.dna_static.find((dna) => {
        if (health.code === dna.code) {
          return dna
        }
      })

      const health_risk: DnaStatic = {
        code: health.code,
        disease: details?.disease,
        disease_th: details?.disease_th,
        checkup: details?.checkup,
        risk_reduction: details?.risk_reduction,
        health_statistic: health,
      }
      top_three_health_risk.push(health_risk)
    }
    return top_three_health_risk
  }

  private async getHighestLifeStyle() {
    if (!this.healths) return
    let heath_score: any = {}

    let lifestyle_score = {
      bmi: [
        { point: '1', count: 0 },
        { point: '2', count: 0 },
        { point: '3', count: 0 },
        { point: '4', count: 0 },
        { point: '5', count: 0 },
      ],
      smoking: [
        { point: '1', count: 0 },
        { point: '2', count: 0 },
        { point: '3', count: 0 },
        { point: '4', count: 0 },
        { point: '5', count: 0 },
      ],
      alcohol_drinking: [
        { point: '1', count: 0 },
        { point: '2', count: 0 },
        { point: '3', count: 0 },
        { point: '4', count: 0 },
        { point: '5', count: 0 },
      ],
      activity_type: [
        { point: '1', count: 0 },
        { point: '2', count: 0 },
        { point: '3', count: 0 },
        { point: '4', count: 0 },
        { point: '5', count: 0 },
      ],
      fruit_and_veggies: [
        { point: '1', count: 0 },
        { point: '2', count: 0 },
        { point: '3', count: 0 },
        { point: '4', count: 0 },
        { point: '5', count: 0 },
      ],
      sleep_duration: [
        { point: '1', count: 0 },
        { point: '2', count: 0 },
        { point: '3', count: 0 },
        { point: '4', count: 0 },
        { point: '5', count: 0 },
      ],
      strees_degress: [
        { point: '1', count: 0 },
        { point: '2', count: 0 },
        { point: '3', count: 0 },
        { point: '4', count: 0 },
        { point: '5', count: 0 },
      ],
    }

    this.healths.forEach((health: Healths) => {
      let [start, end] = health.sleep_duration.split(/[<>-]+/).map(Number)
      lifestyle_score.bmi = this.setScoreBMI(health, lifestyle_score.bmi)
      lifestyle_score.activity_type = this.setScoreActivity(health, lifestyle_score.activity_type)
      lifestyle_score.smoking = this.setScoreSmoking(health, lifestyle_score.smoking)
      lifestyle_score.alcohol_drinking = this.setScoreAlcohol(health, lifestyle_score.alcohol_drinking)
      lifestyle_score.fruit_and_veggies = this.setScoreFood(health, lifestyle_score.fruit_and_veggies)
      lifestyle_score.sleep_duration = this.setScoreSleep(start,  end,  lifestyle_score.sleep_duration)
      lifestyle_score.strees_degress = this.setScoreStress(health, lifestyle_score.strees_degress)

      heath_score = {
        bmi: this.calculateScorePercentage(lifestyle_score.bmi),
        activity_type: this.calculateScorePercentage(lifestyle_score.activity_type),
        sleep_duration:this.calculateScorePercentage(lifestyle_score.sleep_duration),
        strees_degress: this.calculateScorePercentage(lifestyle_score.strees_degress),
        smoking: this.calculateScorePercentage(lifestyle_score.smoking),
        fruit_and_veggies: this.calculateScorePercentage(lifestyle_score.fruit_and_veggies),
        alcohol_drinking: this.calculateScorePercentage(lifestyle_score.alcohol_drinking),
      }
    })

    return heath_score
  }

  private setScoreBMI(health: Healths, bmi: { point: string; count: number }[]) {
    if (health.bmi < 18.5) bmi[0].count += 1
    if (health.bmi >= 18.5 && health.bmi <= 22.9) bmi[1].count += 1
    if (health.bmi >= 23.0 && health.bmi <= 24.9) bmi[2].count += 1
    if (health.bmi >= 25.0 && health.bmi <= 29.9) bmi[3].count += 1
    else bmi[4].count += 1
    return bmi
  }
  private setScoreSmoking(health: Healths, smoking: { point: string; count: number }[]) {
    if (health.smoking === 'the chain-smoker') smoking[0].count += 1
    if (health.smoking === 'once a day') smoking[1].count += 1
    if (health.smoking === 'sometimes') smoking[2].count += 1
    if (health.smoking === 'the smoke quitter') smoking[3].count += 1
    if (health.smoking === 'never smoke') smoking[4].count += 1
    return smoking
  }
  private setScoreAlcohol(health: Healths, alochol: { point: string; count: number }[]) {
    if (health.alcohol_drinking === 'the true drinker') alochol[0].count += 1
    if (health.alcohol_drinking === 'the tippler') alochol[1].count += 1
    if (health.alcohol_drinking === 'the lightweight') alochol[2].count += 1
    if (health.alcohol_drinking === 'occasionally') alochol[3].count += 1
    if (health.alcohol_drinking === 'not at all') alochol[4].count += 1
    return alochol
  }

  private setScoreActivity(health: Healths, activity: { point: string; count: number }[]) {
    if (health.activity_type === 'sedentary') activity[0].count += 1
    if (health.activity_type === 'light activity') activity[1].count += 1
    if (health.activity_type === 'moderate activity') activity[2].count += 1
    if (health.activity_type === 'moderate-to-high activity') activity[3].count += 1
    if (health.activity_type === 'high activity') activity[4].count += 1
    return activity
  }
  private setScoreFood(health: Healths, food: { point: string; count: number }[]) {
    if (health.fruit_and_veggies === 'hardly') food[0].count += 1
    if (health.fruit_and_veggies === 'some') food[1].count += 1
    if (health.fruit_and_veggies === 'not that much') food[2].count += 1
    if (health.fruit_and_veggies === 'about half') food[3].count += 1
    if (health.fruit_and_veggies === 'half and more') food[4].count += 1
    return food
  }
  private setScoreSleep(start: number, end: number, sleep: { point: string; count: number }[]) {
    if (start == 0 && end == 4) sleep[0].count += 1
    if (start == 4 && end == 5) sleep[1].count += 1
    if ((start == 5 && end == 6) || (start == 6 && end == 7)) sleep[2].count += 1
    if (start == 7 && end == 8) sleep[3].count += 1
    if (start == 0 && end == 8) sleep[4].count += 1
    return sleep
  }
  private setScoreStress(health: Healths, stress: { point: string; count: number }[]) {
    if (health.strees_degress === 'always') stress[0].count += 1
    if (health.strees_degress === 'frequently') stress[1].count += 1
    if (health.strees_degress === 'sometimes') stress[2].count += 1
    if (health.strees_degress === 'rarely-to-seldom') stress[3].count += 1
    if (health.strees_degress === 'not at all') stress[4].count += 1
    return stress
  }

  private calculateScorePercentage(array_score) {
    const total: number = array_score.reduce((sum, score) => sum + score.count, 0)
    const map_percent: Array<CountScore> = array_score.map((score: CountScore) => {
      const percentage: number = (score.count / total) * 100
      return {
        point: score.point,
        count: Math.round((percentage + Number.EPSILON) * 100) / 100,
      }
    })

    return map_percent
  }

  private async getTopThreeLifeStyle() {}
}
