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

Route.group(() => {
  Route.group(() => {
    Route.get('/get', 'DcvHealthsController.get')
    Route.get('/get/:id', 'DcvHealthsController.getId')
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
