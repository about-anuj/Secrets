//jshint esversion:6
require('dotenv').config()
const express=require('express');
const bodyParser=require('body-parser');
const ejs=require('ejs');
const session = require('express-session');
const mongoose=require('mongoose');
const passport= require('passport');
const passportLocalMongoose=require('passport-local-mongoose');
const findOrCreate = require('mongoose-findorcreate')
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const app=express();

app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended:true}));
app.set('view engine','ejs');

app.use(session({
    secret: "shh...",
    resave: false,
    saveUninitialized: true
  }));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new GoogleStrategy({
    clientID: '694980978146-gq4856je31d8mkd9foaoks23g1pu928h.apps.googleusercontent.com',
    clientSecret: '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',
    callbackURL: "http://localhost:3000/auth/google/secrets"
  },
  function(accessToken, refreshToken, profile, cb) {
   // console.log(profile);
    User.findOrCreate({ username: profile.emails[0].value, googleId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));

mongoose.connect("mongodb://localhost:27017/userDB");
//mongoose.set("useCreateIndex",true);
const userSchema=new mongoose.Schema({
    email: String,
    password : String,
    googleId:String,
    secret:String
});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

const User=new mongoose.model("User",userSchema);
passport.use(User.createStrategy());

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});
//call back functions for authentication
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile',"email"] })
  );

app.get('/auth/google/secrets', 
  passport.authenticate('google', { failureRedirect: '/' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/secrets');
  });

app.get("/",function(req,res){
  if(req.isAuthenticated())
   {
    res.render("secrets");
   }
  else
   {
    res.render("home",{passNotMatch:""});
   }
    
});

app.get("/register",function(req,res){

    res.render("register",{passNotMatch:""});
});

app.get("/secrets",function(req,res){
  User.find({"secret":{$ne:null}},function(err,foundUser){
    if(err)
    console.log(err);
    else
    {
      if(foundUser){
        res.render("secrets",{userWithSecrets: foundUser});
      }
    }
  });
});

app.get("/logout",function(req,res){
  req.logout();
  res.redirect('/');
})

app.get("/submit",function(req,res){
 if(req.isAuthenticated()){
        res.render("submit");
    }
    else
    {
        res.redirect("/");
    }
});


app.post("/register", function(req, res){
   // console.log(req.body);
      
    /* Registering the user with username and
    password in our database  
    and the model used is "User" */
    User.register({ username :req.body.username }, 
    req.body.password, function (err, user) {      
      if (err) {
        // if some error is occurring, log that error
        res.render("register",{passNotMatch:err.message});
      }
      else {
        passport.authenticate("local")(req, res, function() {
        //  console.log("redirected to secrets after register");
             res.redirect("/secrets"); 
      })
    }
    });
  });

app.post("/",function(req,res){

  
    const user=new User({
      email:req.body.username,
      password:req.body.password
    });
    
    req.login(user, function(err) {
      
      res.status(401).render("home",{passNotMatch:"Wrong Credentials/Unauthorized Error:"+res.statusCode});
     
      if(err) {
        console.log("there might be wrong pass used");
        res.redirect("/");
      }
      else{
        passport.authenticate("local")(req, res, function() {
          // console.log("redirected to secrets after register");
             res.redirect("/secrets"); 
      })
      }
    });
  
});

app.post("/submit",function(req,res){
  const submittedSecret=req.body.secret;

  //console.log(req.user._id);

  User.findById(req.user._id,function(err,foundUser){
    if(err)
    console.log(err);
    else{
      foundUser.secret=submittedSecret;
      foundUser.save(function(){
        res.redirect("/secrets");
      })
    }
  })
});
app.listen(3000,function(){
    console.log("server is running on 3000 ");
});
