import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { google } from 'googleapis'
import csvtojson from 'csvtojson'
import GoogleCloudPlatformsController from './GoogleCloudPlatformsController'

export default class DcvSportsController {
  private authentication: any = null
  private storage_dcv_sports_id = '18m6aaWuuhpHeZTdk2i0Ld7qMLjLraghh'
  private file_name: string = ''
  public async get({ request, response }: HttpContextContract) {
    try {
      const { file_name } = request.params()

      const token = await GoogleCloudPlatformsController.handleRefeshAccessToken()

      const authen = new google.auth.OAuth2()
      authen.setCredentials({ access_token: token })

      if (!authen) return
      this.authentication = authen
      this.file_name = file_name

      const sports_input = await this.readInputCsv()
      const sport_reference = await this.readReferenceCsv()
      const sport_report = this.calculateScore(sports_input, sport_reference)
      return response.json(sport_report)
    } catch (err) {
      console.error(err)
      response.send(err)
    }
  }

  private async readInputCsv() {
    const list = await this.getListFileByNameGroup({ name_group: this.file_name })
    if (!list) return
    const drive = google.drive({ version: 'v3', auth: this.authentication })
    // lists[0] because get single file
    const csv_file = await drive.files.get(
      { fileId: list[0].id, alt: 'media' },
      { responseType: 'stream' }
    )
    const selected_colunm: RegExp = /(sample_number|code|interpret.3scale)/
    const sports_inputs = await csvtojson({
      includeColumns: selected_colunm,
      flatKeys: true,
    }).fromStream(csv_file.data)

    return sports_inputs
  }

  private async readReferenceCsv() {
    const list = await this.getListFileByNameGroup({ name_group: 'reference' })
    if (!list) return
    const drive = google.drive({ version: 'v3', auth: this.authentication })
    // lists[0] because get single file
    const csv_file = await drive.files.get(
      { fileId: list[0].id, alt: 'media' },
      { responseType: 'stream' }
    )

    const read_reference = await csvtojson({
      flatKeys: true,
    }).fromStream(csv_file.data)

    return read_reference
  }

  private async getListFileByNameGroup({ name_group = '' }: { name_group?: string } = {}) {
    const drive = google.drive({ version: 'v3', auth: this.authentication })
    const storage_id = [this.storage_dcv_sports_id]
    const parent_drive = await drive.files.list({
      q: `mimeType='text/csv' and (${storage_id.map((id) => `'${id}' in parents`).join(' or ')})`,
      fields: 'files(name,id)',
    })
    const lists = parent_drive.data.files

    const group_files: { [name: string]: any[] } = {}
    if (lists && lists.length) {
      lists.forEach((file) => {
        if (file.name) {
          const group_name = file.name.replace(/^dcv_sport_|\.csv$/g, '')
          if (group_name in group_files) group_files[group_name].push(file)
          else group_files[group_name] = [file]
        }
      })
      if (name_group !== '') return group_files[name_group]
      return group_files
    }
    return lists
  }

  private calculateScore(sport_data, reference) {
    let sport_report = {}
    sport_data.forEach((data) => {
      let sample_number = data.sample_number

      if (!sport_report[sample_number]) sport_report[sample_number] = []
      let report = {}
      report = {
        code: data.code,
        score: data['interpret.3scale'],
      }
      reference.filter((ref) => {
        if (data.code === ref.code) {
          report = {
            code: data.code,
            score: data['interpret.3scale'],
            detail: ref,
          }
        }
      })
      sport_report[sample_number].push(report)
    })
    return sport_report
  }
}
