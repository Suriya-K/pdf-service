import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import csvtojson from 'csvtojson'
import { google } from 'googleapis'
import GoogleCloudPlatformsController from './GoogleCloudPlatformsController'

export default class DcvHealthsController {
  private storage_dcv_healths_id = '1hgRPKdrrCTqMxuEXwdgF9dMqWhb9VbAL'
  private dcv_health_reference_id = '1EN2ONEOWBuvV8Ei0-F-GuSP_kX64SBX6'
  private authentication: any = null
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

  public async getLists({ response }: HttpContextContract) {
    try {
      const token = await GoogleCloudPlatformsController.handleRefeshAccessToken()
      const authen = new google.auth.OAuth2()
      authen.setCredentials({ access_token: token })
      if (!authen) return
      this.authentication = authen
      const file_list = await this.getListFileByNameGroup()
      response.json(file_list)
    } catch (err) {
      console.error(err)
      return response.send(err)
    }
  }

  public async getId({ request, response }: HttpContextContract) {
    try {
      const token = await GoogleCloudPlatformsController.handleRefeshAccessToken()
      const authen = new google.auth.OAuth2()
      authen.setCredentials({ access_token: token })
      if (!authen) return
      this.authentication = authen
      const req = await request.param('id')
      const file_data = await this.getAllSampleDiease(req)
      response.json(file_data)
    } catch (err) {
      console.error(err)
      return response.send(err)
    }
  }

  public async getBySampleNumber({ request, response }: HttpContextContract) {
    try {
      const token = await GoogleCloudPlatformsController.handleRefeshAccessToken()

      const authen = new google.auth.OAuth2()
      authen.setCredentials({ access_token: token })
      if (!authen) return
      this.authentication = authen

      const sample_number = request.param('sample_number')
      const csv_file_id = request.param('id')
      const file_data = await this.getSampleDieaseBySampleId(sample_number, csv_file_id)

      response.json({ data: file_data })
    } catch (err) {
      console.error(err)
      return response.send(err)
    }
  }

  private async getAllSampleDiease(id) {
    const input_data: Input[] = await this.readInputCsv(id)
    const reference: DcvHealth[] = await this.readReference()
    return await this.calulateScore(input_data, reference)
  }

  private async getSampleDieaseBySampleId(stringId: string, id: string) {
    const input_data: Input[] = await this.readInputCsv(id)
    const reference: DcvHealth[] = await this.readReference()
    return await this.calulateSampleIdScore(input_data, reference, stringId)
  }

  private calulateScore(input_data: Input[], reference: DcvHealth[]) {
    let healthScore: any = {}
    const TOTAL_SCORE: number = 100
    const MAX_SCORE: number = 10

    input_data.forEach((input: Input) => {
      let sample_number = input.sample_number.replace(/\s/g, '')

      if (!healthScore[sample_number]) healthScore[sample_number] = []

      const filterReference = reference.filter((ref) => {
        if (input.code === ref.code && input.sex !== ref.sex_exclude) {
          const sample_score = input['sample.perc']
          // marked
          // const ref_im = ref.important
          // const ref_ur = ref.urgent

          // calulated score 0 ... 10
          const score = (sample_score / TOTAL_SCORE) * MAX_SCORE
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
    const capitalizedID = stringId.toUpperCase().replace(/\s/g, '')
    const TOTAL_SCORE: number = 100
    const MAX_SCORE: number = 10

    input_data.forEach((input: Input) => {
      let sample_number = input.sample_number.replace(/\s/g, '')
      if (!healthScore[capitalizedID]) healthScore[capitalizedID] = []

      if (sample_number === capitalizedID) {
        const filterReference = reference.filter((ref) => {
          if (input.code === ref.code && input.sex !== ref.sex_exclude) {
            const sample_score = input['sample.perc']
            // const ref_im = ref.important
            // const ref_ur = ref.urgent

            // calulated score 0 ... 10
            const score = (sample_score / TOTAL_SCORE) * MAX_SCORE
            ref.disease_score = score
            return ref
          }
        })
        healthScore[capitalizedID].push(filterReference)
      }
    })

    return healthScore
  }

  private async readInputCsv(id: string): Promise<Input[]> {
    let reportInput: Input[] = []
    const csv_file = await this.getFileById(id)
    const SelectedColumn: RegExp = /(sex|sample_number|sample.perc|code)/
    await csvtojson({ includeColumns: SelectedColumn, flatKeys: true })
      .fromStream(csv_file)
      .subscribe((data: any) => {
        reportInput.push(data)
      })
    return reportInput
  }

  private async readReference(): Promise<DcvHealth[]> {
    let reportReferce: DcvHealth[] = []
    // const path: string = Application.resourcesPath('/report-csv/dcv_health_reference.csv')
    // const getReferenceFile = await Drive.use('s3').getStream('dcv_health_reference.csv')
    // const readable = Readable.from(getReferenceFile)
    const csv_file = await this.getFileById(this.dcv_health_reference_id)
    const SelectedColumn: RegExp =
      /(code|category|group|sex_exclude|risk_disease|important|urgent|supplement|risk_reduction|checkup|intro)/
    await csvtojson({ includeColumns: SelectedColumn, flatKeys: true })
      .fromStream(csv_file)
      .subscribe((data: any) => {
        reportReferce.push(data)
      })
    return reportReferce
  }

  private async getListFileByNameGroup() {
    const drive = google.drive({ version: 'v3', auth: this.authentication })
    const storage_id = [this.storage_dcv_healths_id]
    const parent_drive = await drive.files.list({
      q: `mimeType='text/csv' and (${storage_id.map((id) => `'${id}' in parents`).join(' or ')})`,
      fields: 'files(name,id)',
    })
    const test_drive = await drive.files.list()
    console.log(test_drive.data.files)
    const lists = parent_drive.data.files
    return lists
  }

  private async getFileById(id: string) {
    const drive = google.drive({ version: 'v3', auth: this.authentication })
    const csv_file = await drive.files.get({ fileId: id, alt: 'media' }, { responseType: 'stream' })
    return csv_file.data
  }
}
