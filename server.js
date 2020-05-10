import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import mongoose from 'mongoose'

// Defines the port the app will run on. Defaults to 8080, but can be 
// overridden when starting the server. For example:
//
//   PORT=9000 npm start
const port = process.env.PORT || 8080
const app = express()

// Add middlewares to enable cors and json body parsing
app.use(cors())
app.use(bodyParser.json())

// NOT WORKING Middleware to check if database is running or down 
app.use((req, res, next) => {
  if (mongoose.connection.readyState === 1) {
    next()
  } else {
    res.status(503).json({ error: 'Service unavailable' })
  }
})

// Set up database collection and connect to it
const mongoUrl = process.env.MONGO_URL || "mongodb://localhost/animals"
mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true })
mongoose.Promise = Promise

// Database model
const Animal = mongoose.model('Animal', {
  name: String,
  age: Number,
  isFurry: Boolean
})

// Delete and get again every time the server starts
Animal.deleteMany().then(() => {
  new Animal({ name: 'Alfons', age: 2, isFurry: true }).save()
  new Animal({ name: 'Lucy', age: 5, isFurry: true }).save()
  new Animal({ name: 'Goldy the goldfish', age: 1, isFurry: false }).save()
  new Animal({ name: 'Bill', age: 4, isFurry: true }).save()
  new Animal({ name: 'Slim', age: 10, isFurry: false }).save()
  new Animal({ name: 'Lolly', age: 7, isFurry: true }).save()
})

// Start defining your routes here
// Get all animals
app.get('/', (req, res) => {
  Animal.find().then(animals => {
    res.json(animals)
  })
})

// Find one animal
/* app.get('/:name', (req, res) => {
  Animal.findOne({ name: req.params.name }).then(animal => {
    if (animal) {
      res.json(animal)
    } else {
      res.status(404).json({ error: 'Not found' })
    }
  })
}) */

// Find one animal
// With async await
// 400 animal not found
// NOT WORKING 404 How do you define the bad request input? 
app.get('/:name', async (req, res) => {
  try {
    const animal = await Animal.findOne({ name: req.params.name })
    if (animal) {
      res.json(animal)
    } else {
      res.status(404).json({ error: 'Not found' })
    }
  } catch (err) {
    res.status(400).json({ error: 'Invalid input' })
  }
})


/* // Get an animal with a certain age
app.get('/:age', (req, res) => {
  Animal.findOne({ age: req.params.age }).then(animalAge => {
    if (animalAge) {
      res.json(animalAge)
    } else {
      res.status(404).json({ error: 'Age not found' })
    }
  })
}) */

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`)
})
