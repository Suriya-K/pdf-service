import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { google } from 'googleapis'
import Env from '@ioc:Adonis/Core/Env'

export default class GoogleCloudPlatformsController {
  public redirect({ ally }: HttpContextContract) {
    return ally.use('google').redirect()
  }

  public static async get({ response }: HttpContextContract) {
    try {
      // const auth = await this.authen()
      response.json({ msg: 'in route authentication' })
    } catch (err) {
      response.json(err)
      console.error(err)
    }
  }

  public async callback({ ally, response }: HttpContextContract) {
    const ally_google = ally.use('google').stateless()

    if (ally_google.accessDenied())
      return response.json({ type: 'error', message: 'Access Denied' })
    if (ally_google.hasError())
      return response.json({ type: 'has error', msg: ally_google.getError() })

    const access_token = await ally_google.accessToken()
    console.log('token', access_token)
    return response.redirect('/')
  }

  public static async handleRefeshAccessToken() {
    try {
      const ref_token = Env.get('GOOGLE_REFRESH_TOKEN')
      const oauth2Client = new google.auth.OAuth2(
        Env.get('GOOGLE_CLIENT_ID'),
        Env.get('GOOGLE_CLIENT_SECRET')
      )
      oauth2Client.setCredentials({ refresh_token: ref_token })
      const new_access_token = await oauth2Client.refreshAccessToken()

      return new_access_token.credentials.access_token
    } catch (err) {
      console.error('Error refreshing access token:', err.message)

      // Log the error response for further analysis
      console.log('Error Response:', err)
      return err
    }
  }
}
