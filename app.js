const express = require('express')
const bodyParser = require('body-parser')

const app = express();
const db = require('./db/dbConfig')
const cors = require('cors')
const hashTable = require('./hashTable/HashTable.js')

const PORT = process.env.PORT || 4000

app.set('view engine', 'ejs')

app.use(cors())
app.use(express.static(__dirname + '/public'))
app.use(bodyParser.urlencoded({extended:false}))
app.use(bodyParser.json())

app.use('/user_controller',require('./routes/dbRoute'))
app.use('/user',require('./routes/authRoute'))

app.get('/',function(req,res){
    res.render('index',{text_new:[]})
})

app.post('/convert', function(req,res) {
   
    let inputTest = String(req.body.word);
    // text = "अफसर अफसरों दर्पण करीब"
    let inputArr = inputTest.split(" "); //splits the text into array
    let arr = inputArr.map((text)=>{
        return `'${text}'`
    })
   // let textLength = Object.keys(text_split).length; // length of array
    let respArr = []
    let q = `SELECT * FROM urdutohindi WHERE Urdu IN (${arr})`
        try{
            db.query(q,(err,result)=>{
                
                let size = result.length
                const dictionary = new hashTable(size)
                for(let x in result){
                    dictionary.setItem(String(result[x].Urdu),String(result[x].Hindi));
                }
                
                for(let x in inputArr){
                     const data = dictionary.getItem(inputArr[x])
                     //console.log("data",data.split("/"));
                     if(data === null){
                        respArr.push({
                            urdu : inputArr[x],
                            hindi : " ",
                            status : 0
                        })
                    }else{
                        respArr.push({
                            urdu :  inputArr[x],
                            hindi : data.split("/"),
                            status : 1
                        })
                    }
                }
                // console.log(respArr)
                res.render('index',{text_new:respArr})
            })
        }catch(e){
            console.log("database error",e)
        }
})

// setting server
app.listen(PORT, () => {
    console.log(`listening to port ${PORT}`);
}) 