import express from 'express'
import dotenv from 'dotenv'
import connectDB from './config/db.config.js'
import userRouter from './routes/user.route.js'
import { createClient } from 'redis'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import { swaggerUi, swaggerSpec } from "./swagger.js";



dotenv.config()
await connectDB()

const redisurl = process.env.REDIS_URL

if (!redisurl) {
  console.log('Missing redis Url');
  process.exit(1)

}

export const redisClient = createClient({
  url: redisurl
})


redisClient
  .connect()
  .then(() => console.log('redis connected'))
  .catch((err) => console.log(err.message))



const app = express()


app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser());
app.use(cors({
  origin: [process.env.FRONTEND_URL, 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}))
// Swagger route
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const port = process.env.PORT || 5000

app.use('/api/v1', userRouter);
app.get('/', (req, res) => {
  res.send('backend is running')
});

app.listen(port, () => {
  console.log('server is running on', port);
})
