import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import morgan from 'morgan'
import bodyParser from 'body-parser'
import path from 'path'

//security 
import helmet from 'helmet'
import dbConnection from './dbConfig/index.js'
import errorMiddleware from './Middleware/errorMiddleware.js'
import route from './Routes/index.js'
dotenv.config()
const app = express()
const _dirname = path.resolve(path.dirname(""))

const PORT = process.env.PORT || 8800
dbConnection()
app.use(express.static(path.join(_dirname , 'views/build')))
app.use(helmet())
app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:true}))
app.use(express.urlencoded({extended : true}))
app.use(express.json({limit : "10mb"}))

app.use(morgan("dev"))
app.use(errorMiddleware)
app.use(route)

app.listen( PORT , () =>{
    console.log("server is running Sucessfully ");
})