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
  public async callback({ ally, request, response }: HttpContextContract) {
    const existing_refresh = await request.encryptedCookie('refresh_token')
    const existing_access = await request.encryptedCookie('access_token')

    if (!existing_refresh) {
      const ally_google = ally.use('google').stateless()

      if (ally_google.accessDenied())
        return response.json({ type: 'error', message: 'Access Denied' })
      if (ally_google.hasError())
        return response.json({ type: 'has error', msg: ally_google.getError() })

      const access_token = await ally_google.accessToken()

      if (!existing_access || existing_access == undefined) {
        response.encryptedCookie('access_token', access_token.token, { maxAge: '1h' })
      }
      response.encryptedCookie('refresh_token', access_token.refreshToken)
    }
    return response.redirect('/')
  }

  public static async handleRefeshAccessToken(ref_token) {
    try {
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
