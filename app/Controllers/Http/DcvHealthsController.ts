import Application from '@ioc:Adonis/Core/Application'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import csvtojson from 'csvtojson'

export default class DcvHealthsController {
  public async create({ request, response }: HttpContextContract) {
    const test = await this.calculatedDiseaseScore()
    return response.json({ data: test })
  }

  private async calculatedDiseaseScore() {
    let healthScore: HealthScore[] = []
    const input_data: Input[] = await this.readInputCsv()
    const reference: DcvHealth[] = await this.readReference()
    const TOTAL_SCORE: number = 100 * 3 * 3
    const MAX_SCORE: number = 10

    input_data.map((data) => {
      let health: HealthScore = {}
      health.sample = data
      health.score_lists = reference.map((ref) => {
        // exclude disease that are spicific gender
        if (data.sex === ref.sex_exclude) return {}

        const sample_score = data['sample.perc']
        const ref_im = ref.important
        const ref_ur = ref.urgent

        // calulated score 0 ... 10
        const score = ((sample_score * ref_im * ref_ur) / TOTAL_SCORE) * MAX_SCORE

        return { code: ref.code, score: score.toFixed(2) }
      })
      healthScore.push(health)
    })
    return healthScore
  }

  private async readInputCsv(): Promise<Input[]> {
    let reportInput: Input[] = []
    const path: string = Application.resourcesPath('/report-csv/sample_dcv_h_input.csv')
    const SelectedColumn: RegExp = /(sex|sample_number|sample.perc)/
    await csvtojson({ includeColumns: SelectedColumn, flatKeys: true })
      .fromFile(path)
      .subscribe((data: any) => {
        reportInput.push(data)
      })
    return reportInput
  }

  private async readReference(): Promise<DcvHealth[]> {
    let reportReferce: DcvHealth[] = []
    const path: string = Application.resourcesPath('/report-csv/dcv_health_reference.csv')
    const SelectedColumn: RegExp =
      /(code|category|group|sex_exclude|risk_disease|important|urgent|supplement|risk_reduction|checkup|intro)/
    await csvtojson({ includeColumns: SelectedColumn, flatKeys: true })
      .fromFile(path)
      .subscribe((data: any) => {
        reportReferce.push(data)
      })
    return reportReferce
  }
}
