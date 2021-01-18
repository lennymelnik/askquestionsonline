
var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var path = require('path');
var fs = require('fs');
var http = require('http');
var https = require('https');
var nodeRequest = require('request')
var bcrypt = require('bcrypt');
var cors = require('cors');

var uniqid = require('uniqid')
const saltRounds = 10;

var app = express();


app.use(session({
    secret: 'e022516b41f20607ff76f00c7f594692',
    resave: true,
    saveUninitialized: true
}));



app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(cors())
app.use(bodyParser.json());

//Add css
app.use(express.static('assets'))


const MongoClient = require('mongodb').MongoClient;

const url = 'mongodb://prstash.com:27018';








const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')('ACc0b7fe56800a78f70e62d0274a7da938', '61ce8ca67ca7312033e74b7ece267099');
const MessagingResponse = require('twilio').twiml.MessagingResponse;

async function findQuestion(){
    var res
    const mongo = await MongoClient.connect(url, { useNewUrlParser: true })
        .catch(err => { console.log(err); });

    if (!mongo) {
        return;
    }

    try {

        const db = mongo.db("hackathon");

        let collection = db.collection('questions');

        
        
        res = await collection.find( { questionId : { $exists: true } } ).toArray()

       

    } catch (err) {

       
    } finally {

        mongo.close();
    }
    return res
}
async function findUser(search){
    var res
    const mongo = await MongoClient.connect(url, { useNewUrlParser: true })
        .catch(err => { console.log(err); });

    if (!mongo) {
        return;
    }

    try {

        const db = mongo.db("hackathon");

        let collection = db.collection('users');

        let query = search

        res = await collection.findOne(query);

       

    } catch (err) {

       
    } finally {

        mongo.close();
    }
    return res
}

async function addUser(user){

    var userObj
    var exists
    //If they text
    if(user.num){

        console.log("Findin user")
        exists = await findUser({num : user.num})
        console.log(exists.id)
        if(!exists){
            userObj = {
                num : user.num,
                verified : true,
                userId : uniqid()
            }
            
        }else{
            return exists.userId
        }
     
        
        

    }else if(user.email){
      
        exists = await findUser({email : user.email})
        if(!exists){
            userObj = user
            userObj.verified = false,
            userObj.userId = uniqid()
            
            
        }else{
            return exists.userId
        }
       
    }
    if(userObj){
                const mongo = await MongoClient.connect(url, { useNewUrlParser: true })
                .catch(err => { console.log(err); });

            if (!mongo) {
                return;
            }

            try {

                const db = mongo.db("hackathon");

                let collection = db.collection('users');

                let query = userObj

                let res = await collection.insertOne(query);

        

            } catch (err) {

        
            } finally {

                mongo.close();
            }

            return userObj.userId

    }else{
        console.log("User exists already")
        console.log(exists)
        
    }
    
 
}

async function addreply(questionId, reply, userId, targetUserId){
    console.log("THIS IS ID",targetUserId)
    user = await findUser({id : questionId})
   

    const mongo = await MongoClient.connect(url, { useNewUrlParser: true })
        .catch(err => { console.log(err); });

    if (!mongo) {
        return;
    }

    try {

        const db = mongo.db("hackathon");

        let collection = db.collection('questions');

        let query = {questionId : questionId}
        let newInfo = {$push :{
            replys : {message : reply, userId : userId}
        }}

        let res = await collection.updateOne(query,newInfo);

  

    } catch (err) {

   
    } finally {
        mongo.close();
        //If send notificatoin to user
        targetUser = await findUser({userId : targetUserId})
        //user = await findUser({userId : userId})
        console.log(user)
        console.log(reply)

        body = targetUserId + " has responded to your question with: " + reply
        if(targetUser.num){
            client.messages
      .create({body: body, from: '+12674332248', to: targetUser.num})
      .then(message => console.log("Sent Reply"));

        }else{
            //Send email
        }


    }
    

}

async function addquestion(question, userId, num,username){
    
    var questionObj = {
        userId : userId,
        question : question,
        questionId : uniqid()
    }
    if(username){
        questionObj.username = username
    }
    if(num){
        questionObj.num = num
    }

    const mongo = await MongoClient.connect(url, { useNewUrlParser: true })
        .catch(err => { console.log(err); });

    if (!mongo) {
        return;
    }

    try {

        const db = mongo.db("hackathon");

        let collection = db.collection('questions');

        let query = questionObj

        let res = await collection.insertOne(query);

  

    } catch (err) {

   
    } finally {

        mongo.close();
    }
    

}

app.post('/addQuestion', (req, res) => {

   
    addquestion(req.body.question,req.body.userId,req.body.From,req.body.username)
    twiml.message("Your question will be posted and you will be sent all the replys");
    res.writeHead(200, { 'Content-Type': 'text/xml' });
    res.end("sent");
    
  });


app.post('/reply', (req, res) => {
    console.log(req.body)

    addreply()
    console.log("adding reply")
   
    res.writeHead(200, { 'Content-Type': 'text/xml' });
    res.end("Bro");
    
  });
  app.post('/sms', (req, res) => {
    const twiml = new MessagingResponse();
    console.log(req.body.Body)
    console.log(req.body.From)
    mobileUser = {num : req.body.From, questions : req.body.Body}
    //get user ID from creating or existing
    addStuff(req,res,twiml)
    async function addStuff(req,res,twiml){
        id = await addUser({num : req.body.From})
  
        addquestion(req.body.Body,id, req.body.From)
        twiml.message("Your question will be posted and you will be sent all the replys");
        res.writeHead(200, { 'Content-Type': 'text/xml' });
        res.end(twiml.toString());
        
    }
    
  });

  app.post('/login', async(req, res) => {
    var userObj = {email : req.body.email, password : req.body.password}
    
    getInfo(userObj,res,req)
    async function getInfo(userObj, res, req){
        
        userData = await findUser({email : userObj.email, password : userObj.password})
        if(userData){
            res.json(userData)
        }else{
    
        res.json("Wrong info")

        }
        
        console.log(userData)
        
    }
   
  
  })
  app.post('/register', async(req, res) => {
    const { email, username, password } = req.body
    var userObj = {email : req.body.email, password : req.body.password, name : req.body.name,  year : req.body.year, major : req.body.major, campus : req.body.campus}
    
    getInfo(userObj,res,req)
    
    async function getInfo(userObj, res, req){
        
        userData = await findUser({email : userObj.email})
        if(userData){
            res.json("User exists")
        }else{
            id = await addUser(userObj)
        console.log(id)
        userData = await findUser({userId : id})
        res.json(userData)

        }
        
        console.log(userData)
        
    }
    
  
  })
  app.get('/questions', async(req, res) => {
   
    getQuestions(res)
    async function getQuestions(res){
       
        questions = await findQuestion()
        console.log("questinos: ",questions)
        res.json(questions)

        
        
    }
    
  
  })
  

  app.listen(88)