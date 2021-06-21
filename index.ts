import express from 'express'
const app = express()

const PORT = 8000

app.get('/', async (req, res) => {

  res.send('ok')
})

app.listen(PORT, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${PORT}`)
})