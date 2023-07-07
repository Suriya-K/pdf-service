import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { google } from 'googleapis'
import Env from '@ioc:Adonis/Core/Env'

export default class GoogleCloudPlatformsController {
  private static credentials = {
    web: {
      client_id: Env.get('GOOGLE_AUTH_CLIENT_ID'),
      project_id: Env.get('GOOGLE_AUTH_PROJECT_ID'),
      auth_uri: Env.get('GOOGLE_AUTH_AUTH_URL'),
      token_uri: Env.get('GOOGLE_AUTH_TOKEN_URL'),
      auth_provider_x509_cert_url: Env.get('GOOGLE_AUTH_CERT_URL'),
      client_secret: Env.get('GOOGLE_AUTH_CLIENT_SECRET'),
      redirect_uris: [Env.get('GOOGLE_AUTH_REDIRECT_URL')],
    },
  }

  public static async get({ response }: HttpContextContract) {
    try {
      const auth = await this.authen()
      response.json({ msg: 'in route authentication' })
    } catch (err) {
      response.json(err)
      console.error(err)
    }
  }

  public static async authen() {
    let client = await this.loadSavedCredentialsIfExist()
    if (client) return client

    this.saveCredentials(client)
    return client
    // client = await authenticate({ scopes: this.SCOPES, keyfilePath: this.CREDENTIALS_PATH })
    // FOR GENERATE CLIENT TOKEN ONLY FOR PRODUCTION USE ENVIRONMENT
    // if (client?.credentials) await this.saveCredentials(client)
    // return client
  }

  private async getSheetList(auth) {
    const id = '13UyhGq3ZlY4aPfV7XNQJVZHhBjrM_l0S-pYs5CN-iu0'
    const sheets = google.sheets({ version: 'v4', auth })
    const sheet_data = (await sheets.spreadsheets.get({ spreadsheetId: id })).data
    const response = sheet_data.sheets?.map((s) => {
      return s.properties?.title
    })
    return response
  }

  private async getDrive(auth) {
    const drive = google.drive({ version: 'v3', auth })
    const storage_id: string = '19dbu-J_8iAQ0ots_iG3Pbpgk4fayzW5E'
    const response = await drive.files.list({ q: `'${storage_id}' in parents` })
    const files = response.data.files
    if (!files) return 'Files not found'
    return files
  }

  private static async loadSavedCredentialsIfExist() {
    try {
      const token = {
        type: Env.get('CLIENT_TYPE'),
        client_id: Env.get('CLIENT_ID'),
        client_secret: Env.get('CLIENT_SECRET'),
        refresh_token: Env.get('CLIENT_REFRESH_TOKEN'),
      }
      const credentials = JSON.parse(JSON.stringify(token))
      return google.auth.fromJSON(credentials)
    } catch (err) {
      console.error(err)
      return err
    }
  }

  private static async saveCredentials(client) {
    const keys = JSON.parse(JSON.stringify(this.credentials))
    const key = keys.installed || keys.web
    Env.set('CLIENT_TYPE', 'authorized_user')
    Env.set('CLIENT_ID', key.client_id)
    Env.set('CLIENT_SECRET', key.client_secret)
    Env.set('CLIENT_REFRESH_TOKEN', client.credentials.refresh_token)
    // const payload = JSON.stringify({
    //   type: 'authorized_user',
    //   client_id: key.client_id,
    //   client_secret: key.client_secret,
    //   refresh_token: client.credentials.refresh_token,
    // })
    // await fs.writeFile(this.TOKEN_PATH, payload)
  }
}
