import Drive from '@ioc:Adonis/Core/Drive'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { Readable } from 'stream'
import csvtojson from 'csvtojson'

export default class DcvHealthsController {
  public async postFile({ request, response }: HttpContextContract) {
    const csvFile = request.file('csv')
    if (csvFile) {
      try {
        await csvFile.moveToDisk('', { name: 'sample_dcv_h_input.csv', overwrite: true }, 's3')
        return response.status(200).send('upload file successfully')
      } catch (err) {
        response.send(err)
      }
    } else {
      return response.status(404).send('upload file not found')
    }
  }

  public async get({ response }: HttpContextContract) {
    const sample = await this.getAllSampleDiease()
    return response.json({ data: sample })
  }

  public async getId({ request, response }: HttpContextContract) {
    const req = request.param('id')
    const sample = await this.getSampleDieaseBySampleId(req)
    return response.json({ data: sample })
  }

  private async getAllSampleDiease() {
    const input_data: Input[] = await this.readInputCsv()
    const reference: DcvHealth[] = await this.readReference()
    return this.calulateScore(input_data, reference)
  }

  private async getSampleDieaseBySampleId(stringId: string) {
    const input_data: Input[] = await this.readInputCsv()
    const reference: DcvHealth[] = await this.readReference()
    return this.calulateSampleIdScore(input_data, reference, stringId)
  }

  private calulateScore(input_data: Input[], reference: DcvHealth[]) {
    let healthScore: any = {}
    const TOTAL_SCORE: number = 100 * 3 * 3
    const MAX_SCORE: number = 10

    input_data.forEach((input: Input) => {
      let sample_number = input.sample_number

      if (!healthScore[sample_number]) healthScore[sample_number] = []

      const filterReference = reference.filter((ref) => {
        if (input.code === ref.code && input.sex !== ref.sex_exclude) {
          const sample_score = input['sample.perc']
          const ref_im = ref.important
          const ref_ur = ref.urgent

          // calulated score 0 ... 10
          const score = ((sample_score * ref_im * ref_ur) / TOTAL_SCORE) * MAX_SCORE
          ref.disease_score = score
          return ref
        }
      })

      healthScore[sample_number].push(filterReference)
    })

    return healthScore
  }

  private calulateSampleIdScore(input_data: Input[], reference: DcvHealth[], stringId: string) {
    let healthScore: any = {}
    const capitalizedID = stringId.toUpperCase()
    const TOTAL_SCORE: number = 100 * 3 * 3
    const MAX_SCORE: number = 10

    input_data.forEach((input: Input) => {
      if (!healthScore[capitalizedID]) healthScore[capitalizedID] = []

      if (input.sample_number === capitalizedID) {
        const filterReference = reference.filter((ref) => {
          if (input.code === ref.code && input.sex !== ref.sex_exclude) {
            const sample_score = input['sample.perc']
            const ref_im = ref.important
            const ref_ur = ref.urgent

            // calulated score 0 ... 10
            const score = ((sample_score * ref_im * ref_ur) / TOTAL_SCORE) * MAX_SCORE
            ref.disease_score = score
            return ref
          }
        })
        healthScore[capitalizedID].push(filterReference)
      }
    })

    return healthScore
  }

  private async readInputCsv(): Promise<Input[]> {
    let reportInput: Input[] = []
    // const path: string = Application.resourcesPath('/report-csv/sample_dcv_h_input.csv')
    const getCsvInputFile = await Drive.use('s3').getStream('sample_dcv_h_input.csv')
    const readable = Readable.from(getCsvInputFile)
    const SelectedColumn: RegExp = /(sex|sample_number|sample.perc|code)/
    await csvtojson({ includeColumns: SelectedColumn, flatKeys: true })
      .fromStream(readable)
      .subscribe((data: any) => {
        reportInput.push(data)
      })
    return reportInput
  }

  private async readReference(): Promise<DcvHealth[]> {
    let reportReferce: DcvHealth[] = []
    // const path: string = Application.resourcesPath('/report-csv/dcv_health_reference.csv')
    const getReferenceFile = await Drive.use('s3').getStream('dcv_health_reference.csv')
    const readable = Readable.from(getReferenceFile)
    const SelectedColumn: RegExp =
      /(code|category|group|sex_exclude|risk_disease|important|urgent|supplement|risk_reduction|checkup|intro)/
    await csvtojson({ includeColumns: SelectedColumn, flatKeys: true })
      .fromStream(readable)
      .subscribe((data: any) => {
        reportReferce.push(data)
      })
    return reportReferce
  }
}
