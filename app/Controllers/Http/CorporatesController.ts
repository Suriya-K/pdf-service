// import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class CorporatesController {
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
  private async readInputCsv() {}
}
