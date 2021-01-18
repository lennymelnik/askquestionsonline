var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var path = require('path');
var fs = require('fs');
var http = require('http');
var https = require('https');
var nodeRequest = require('request')
var bcrypt = require('bcrypt');
var expressLayouts = require('express-ejs-layouts')
var uniqid = require('uniqid')
const saltRounds = 10;



var privateKey = fs.readFileSync('/etc/letsencrypt/live/askquestions.online/privkey.pem', 'utf8');
var certificate = fs.readFileSync('/etc/letsencrypt/live/askquestions.online/fullchain.pem', 'utf8');
var credentials = {
    key: privateKey,
    cert: certificate
};

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;


const client = require('twilio')('ACc0b7fe56800a78f70e62d0274a7da938', '61ce8ca67ca7312033e74b7ece267099');
const MessagingResponse = require('twilio').twiml.MessagingResponse;



var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;
const { equal } = require('assert');
var url = "mongodb://prstash.com:27018/mydb";




MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("hackathon");
    var app = express();

 


    app.use(session({
        secret: 'e022516b41f20607ff76f00c7f594692',
        resave: true,
        saveUninitialized: true
    }));

    app.set('views', path.join(__dirname, 'views'));
    app.set('view engine', 'ejs');
    app.set('layout', 'layout');

    app.use(expressLayouts);

    app.use(bodyParser.urlencoded({
        extended: true
    }));

    app.use(bodyParser.json());

    //Add css
    app.use(express.static('assets'))
    app.use(function(req, res, next) {
        dbo.collection("questions").find({}).toArray(function(err, result){
            res.locals.questions = result.reverse()
            res.locals.user = req.session.user
        next()
         
          });
        
        
            })


    //Send users to main page
    app.get('/', function(req, res) {
      
            res.render('main');

         
      


    });
    app.post('/login', function(req, res) {
        

        var userObj = {email : req.body.email, password : req.body.password}
        dbo.collection("users").find(userObj).toArray(function(err, result){
            console.log("adding user")
            console.log(result)
            if(result[0]){
                req.session.user = result[0]
                res.redirect("/");

            }else{
                res.redirect("/login");

            }
            

         
          });


    });
    app.get('/login', function(req, res) {
        
        res.sendFile(path.join(__dirname + '/login.html'));


    });
    app.get('/register', function(req, res) {
        
        res.sendFile(path.join(__dirname + '/register.html'));


    });
    app.get('/question', function(req, res) {
        if(req.query.questionId){
            dbo.collection("questions").findOne({questionId : req.query.questionId},function(err, result){
                res.render('oneQuestion',{question : result})
            })
        }else{
            res.render('ask')
        }
        


    });
    app.post('/register', function(req, res) {

        var userObj = {email : req.body.email, password : req.body.password, name : req.body.name,  year : req.body.year, major : req.body.major, campus : req.body.campus, userId : uniqid()}        
            dbo.collection("users").findOne({email : userObj.email},function(err, result){
            
                if(result){
                    res.render('main',{questions : result});
    
                }else{
                    dbo.collection("users").insertOne(userObj,function(err, result){
            
                        if(result){
                            console.log(result)
                            req.session.user = result
                            res.render('main',{questions : result});
            
                        }else{
                            res.redirect("/register");
            
                        }

                      });
    
                }
             
              });
           


    });
    app.post('/reply', function(req, res) {

        var replyObj = {questionId : req.query.questionId, reply : req.body.reply, userId : req.query.userId, targetUserId: req.query.targetUserId}
        var add = {
            $push : {
                replys : {userid : replyObj.userId, reply : replyObj.reply, user : req.session.user}
            }
        }
        dbo.collection("questions").updateOne({questionId : replyObj.questionId},add,function(err, result){


            dbo.collection("users").find({userId : replyObj.targetUserId}).toArray(function(err, result){
                console.log("GOT HERE",result[0])
                if(result[0].num){
                    body = req.session.user.name +  " has just answered your question: " + replyObj.reply
                    client.messages
                    .create({body: body, from: '+12674332248', to: result[0].num})
                    .then(message => console.log("Sent Reply"));
                }

                res.redirect('/')
            })
            


          });

    });
    app.post('/question', function(req, res) {

        var questionObj = {
            userId : req.session.user.userId,
            question : req.body.question,
            questionId : uniqid(),
            user : req.session.user
        }
               
        dbo.collection("questions").insertOne(questionObj,function(err, result){

            res.redirect('/')
         
          });

    });

    app.post('/sms', function(req, res) {
        const twiml = new MessagingResponse();
        console.log(req.body.Body)
        console.log(req.body.From)
        mobileUser = {num : req.body.From, questions : req.body.Body}
        //get user ID from creating or existing
        dbo.collection("users").findOne({num : req.body.From},function(err, result){
            console.log(result)
            if(result){
                //User exists
                var questionObj = {
                    userId : result.userId,
                    question : req.body.Body,
                    questionId : uniqid()
                }
                dbo.collection("questions").insertOne(questionObj,function(err, result){
                    twiml.message("Your question will be posted and you will be sent all the replys");
                    res.writeHead(200, { 'Content-Type': 'text/xml' });
                    res.end(twiml.toString());
                })

            }else{
                userObj = {
                    userId : uniqid(),
                    num : req.body.From,
                    verified : true
                }
                var questionObj = {
                    userId : userObj.userId,
                    question : req.body.Body,
                    questionId : uniqid()
                }
                dbo.collection("users").insertOne(userObj,function(err, result){
                    
                    dbo.collection("questions").insertOne(questionObj,function(err, result){
                        twiml.message("Your question will be posted and you will be sent all the replys" + userObj.userId);
                        res.writeHead(200, { 'Content-Type': 'text/xml' });
                        res.end(twiml.toString());
                    })

                  });

            }
         
          });
      
        })
        
    
    
    http.createServer(function (req, res) {
        res.writeHead(301, { "Location": "https://" + req.headers['host'] + req.url });
        res.end();
      }).listen(80);
      
      var httpsServer = https.createServer(credentials, app);
      
      httpsServer.listen(443)

})