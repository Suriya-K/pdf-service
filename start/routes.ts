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

Route.get('/', async ({ response }) => {
  const routes: any = []
  const route_path = Route.toJSON()
  route_path['root'].forEach((route) => {
    routes.push(route.pattern)
  })

  return response.json({ routes })
})

Route.group(() => {
  Route.group(() => {
    Route.get('/get/files/lists', 'DcvHealthsController.getLists')
    Route.get('/get/files/:id', 'DcvHealthsController.getId')
    Route.get('/get/:sample_number/:id', 'DcvHealthsController.getBySampleNumber')
    Route.post('/upload', 'DcvHealthsController.postFile')
  }).prefix('/healths')

  Route.group(() => {
    Route.get('/get/:file_name', 'DcvSportsController.get')
  }).prefix('/sports')
}).prefix('/dcv')

Route.post('/corporates-get', 'CorporatesController.get')
Route.get('/corporates-get/:file_name', 'CorporatesController.get')
Route.get('/corporates-getlist', 'CorporatesController.getAll')

Route.get('/google/test', 'GoogleCloudPlatformsController.authen')
Route.get('/google/auth', 'GoogleCloudPlatformsController.redirect')
Route.get('/google/callback', 'GoogleCloudPlatformsController.callback')
Route.get('/google/token', 'GoogleCloudPlatformsController.getRefresh')
