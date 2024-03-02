const express = require('express')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')

const app = express()
app.use(express.json())
const dbpath = path.join(__dirname, 'todoApplication.db')

let db = null

const intializingdbserver = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    })

    app.listen(3000, () => {
      console.log('Server running at localhost/3000')
    })
  } catch (e) {
    console.log(e.message)
    process.exit(1)
  }
}
intializingdbserver()

const priorityandstatus = req => {
  return req.status !== undefined && req.priority !== undefined
}
const prioritypro = req => {
  return req.priority !== undefined
}

const statuspro = req => {
  return req.status !== undefined
}

app.get('/todo/', async (request, response) => {
  const {search_q = ' ', priority, status} = request.query
  let statusresponse = null
  let gettodoquery = ''

  switch (true) {
    case priorityandstatus(request.query):
      gettodoquery = `
     SELECT * FROM todo 
     WHERE todo LIKE "%${search_q}%" AND
      status="${status}" AND priority="${priority}" 
 `
      break

    case prioritypro(request.query):
      gettodoquery = `
     SELECT * FROM todo 
     WHERE todo LIKE "%${search_q}%"
      AND priority="${priority}" 
 `
      break
    case statuspro(request.query):
      gettodoquery = `
     SELECT * FROM todo 
     WHERE todo LIKE "%${search_q}%"  AND
      status="${status}" 
 `
      break
    default:
      gettodoquery = `
     SELECT * FROM todo 
     WHERE todo LIKE "%${search_q}%"
`
  }

  statusresponse = await db.all(gettodoquery)
  response.send(statusresponse)
})

app.get('/todo/:todoId', async (request, response) => {
  const {search_q = ' ', priority, status} = request.query
  const {todoId} = request.params
  let statusresponse = null
  let gettodoquery = `
     SELECT * FROM todo 
     WHERE id="${todoId}"
`

  statusresponse = await db.all(gettodoquery)
  response.send(statusresponse)
})

app.post('/todo/', async (request, response) => {
  const {id, todo, priority, status} = request.body
  const {todoId} = request.params

  let gettodoquery = `
  INSERT INTO todo(id,todo,priority,status)
  VALUES( ${id},"${todo}","${priority}" ,"${status}")

`

  await db.run(gettodoquery)
  response.send('Todo Successfully Added')
})

app.put('/todo/:todoId', async (request, response) => {
  const requestbody = request.body
  const {todoId} = request.params
  let updatecolumn = ''

  switch (true) {
    case requestbody.todo !== undefined:
      updatecolumn = 'Todo'
      break
    case requestbody.priority !== undefined:
      updatecolumn = 'Priority'
      break
    case requestbody.status !== undefined:
      updatecolumn = 'Status'
      break
  }

  const previous = `
  SELECT * FROM todo
  WHERE id=${todoId}
  
  `
  const presets = await db.get(previous)
  const {
    todo = presets.todo,
    priority = presets.priority,
    status = presets.status,
  } = request.body

  let gettodoquery = `
  UPDATE todo
    SET 
    todo="${todo}",
    priority="${priority}",
    status="${status}"

    WHERE id=${todoId}

    
  
  
  

`

  await db.run(gettodoquery)
  response.send(`${updatecolumn} Successfully Updated`)
})

app.delete('/todo/:todoId', async (request, response) => {
  const {todo, priority, status} = request.body
  const {todoId} = request.params

  let gettodoquery = `
  DELETE FROM todo 
  WHERE id="${todoId}"


    
  
  
  

`

  let statusresponse = await db.run(gettodoquery)
  response.send('Todo Deleted')
})

module.exports = app
