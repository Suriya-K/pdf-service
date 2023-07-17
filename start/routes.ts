/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/cart'
| import './routes/customer'
|
*/

import Route from '@ioc:Adonis/Core/Route'

Route.get('/', async () => {
  return { hello: 'world' }
})

Route.get('/dcv-get', 'DcvHealthsController.get')
Route.get('/dcv-get/:id', 'DcvHealthsController.getId')
Route.post('/dcv-upload', 'DcvHealthsController.postFile')

Route.post('/corporates-get', 'CorporatesController.get')
Route.get('/corporates-get/:file_name', 'CorporatesController.get')
Route.get('/corporates-getlist', 'CorporatesController.getAll')

Route.get('/google/test','GoogleCloudPlatformsController.authen')
Route.get('/google/auth','GoogleCloudPlatformsController.redirect')
Route.get('/google/callback','GoogleCloudPlatformsController.callback')
