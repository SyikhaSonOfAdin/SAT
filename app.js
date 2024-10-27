require('dotenv').config();
const express = require('express')  ;
const path = require('path') ;
const cors = require('cors');
const ARRAY_PATH = require('./src/.conf/path-conf');

const app = express();
const port = 3000;
const corsOptions = {
    origin: 'https://sat.syikha.com',
    optionsSuccessStatus: 200
}
app.use(cors(corsOptions));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '')));


app.get('/', (req, res) =>{
    res.send('<h1>Hi Your SAT API is Available🚀</h1>')
})


app.use('/api/post', ...ARRAY_PATH.POST)
app.use('/api/get', ...ARRAY_PATH.GET)

app.listen(process.env.PORT || port, () => {
    console.log(`Server berjalan di port ${port} on http://localhost:${port}`);
});

