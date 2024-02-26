const express = require('express')
const path = require('path')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')

const app = express()
module.exports = app
app.use(express.json())
const dbPath = path.join(__dirname, 'todoApplication.db')

let db = null

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server started at http://localhost:3000/')
    })
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
    process.exit(1)
  }
}
initializeDBAndServer()

//API 1
app.get('/todos/', async (request, responce) => {
  const {status = '', priority = '', search_q = ''} = request.query
  const sqlQuery = `
  SELECT *
  FROM
    todo
  WHERE
    todo like '%${search_q}%'
    AND
    status like '%${status}%'
    AND
    priority like '%${priority}%';`
  const dbResponce = await db.all(sqlQuery)
  responce.send(dbResponce)
})

//API 2
app.get('/todos/:todoId/', async (request, responce) => {
  const {todoId} = request.params
  const sqlQuery = `
  SELECT *
  FROM
    todo
  WHERE
    id = ${todoId};`
  const dbResponce = await db.get(sqlQuery)
  responce.send(dbResponce)
})

//API 3

app.post('/todos/', async (request, responce) => {
  const {todo, priority, status} = request.body
  const sqlQuery = `
  INSERT INTO
  todo (todo,priority,status)
  VALUES
    ('${todo}',
    '${priority}',
    '${status}');`
  await db.run(sqlQuery)
  responce.send('Todo Successfully Added')
})

//API 4

app.put('/todos/:todoId/', async (request, responce) => {
  const {todoId} = request.params
  const {status, priority, todo} = request.body
  let keys = Object.keys(request.body)
  keys = keys.map(word => {
    return word[0].toUpperCase() + word.slice(1)
  })

  let result = 'Updated Successfully'
  if (keys.length === 1) {
    result = keys[0] + ' Updated'
  }
  const sqlQuery = `
  UPDATE
    todo
  SET
    todo = '${todo}',
    priority = '${priority}',
    status = '${status}'
  WHERE
    id = ${todoId};`
  await db.run(sqlQuery)
  responce.send(result)
})

//API 5

app.delete('/todos/:todoId/', async (request, responce)=>{
  const {todoId} = request.params
  const sqlQuery =`
  DELETE FROM
    todo
  WHERE
    id = ${todoId};`
  await db.run(sqlQuery)
  responce.send("Todo Deleted")
})