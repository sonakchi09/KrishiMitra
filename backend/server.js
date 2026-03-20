import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import connectDB from './config/mongodb.js'   // ← ADD
import userRouter from './routes/userRoute.js'

dotenv.config()   // ← ADD (must be before PORT read)
connectDB()       // ← ADD

const app = express()
const PORT = process.env.PORT || 4000

app.use(express.json())
app.use(cors())

app.use('/api/user', userRouter)

app.listen(PORT, () => console.log(`Server started at port ${PORT}`))