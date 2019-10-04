
//Requirements
const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session');
const { getUserByEmail } = require('./helpers.js')

// const getUserByEmail = getUserByEmailExport();

const app = express();
const bcrypt = require('bcrypt');



//Port Setting
const PORT = 8080; // default port 8080

//App Settings
app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({extended: true}));
app.use(morgan(':method :url :status :response-time ms - :res[content-length]'));
app.use(cookieParser());
app.use(cookieSession({
  name: 'session',
  keys: ["sdf"],
}));

// ===============================
// FUNCTIONS

//generate random string varying size, cb defines size
const generateRandomString = function(length) {
  let newShortUrl = "";
  let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < length; i++) {
    newShortUrl += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return newShortUrl;
};

// True/false found password function
const foundPassword = function(passwordId) {
  for (key in users) {
    if (bcrypt.compareSync(passwordId, users[key].password) === true) {
      return true;
    }
  }
  return false;
};

const getTemplateVars = function(req) {
  let userId = req.session.user_id;
  // console.log("templatevars req params: ", req.params);
  let user = users[userId];
  // console.log("templatevar userId: ", userId);
  // console.log("templatevars users object", users);
  // console.log("var user: ", user);
  let templateVars = {
    urls: urlDatabase,
    urlsforUserId: urlsForUser(userId),
    user: user
  };
  // console.log(templateVars);
  return templateVars;
};

//returns array of object urls based on userId (cookie id)
const urlsForUser = function(id) {
  let urlIds = [];
  // console.log(id);
  for (let key in urlDatabase) {
    if (urlDatabase[key].userId === id) {
      urlIds.push(urlDatabase[key])
      // console.log("adding this key: ", urlDatabase[key]);
    }
    
  }
  return urlIds;
}
// ===============================
// SERVER OBJECTS
//Users object
const users = {
  "test": {
    user_id: "test",
    email: "test@test.com",
    password: "$2b$10$SAka14YqvrRtgIdbZiVeNuyN3PdRciKhR1hDNVSi6/W/zhDNc0j3O"
  },
};

//Basic Url DB
const urlDatabase = {
  "b2xVn2": {shortURL: "b2xVn2", longURL: "http://www.lighthouselabs.ca", user_id: "test"},
  "9sm5xK": {shortURL: "9sm5xK", longURL: "http://www.google.com", user_id: "d6gd323d"},
  "7f6t7d": {shortURL: "7f6t7d", longURL: "https://abebooks.com", user_id: "test"},
};

// ===============================
// EXPRESS APP

app.get("/", (req, res) => {
  res.send("Hello!");
});

//Return db info as json
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//EE
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello there, and welcome to this Easter Egg.<b>World</b></body></html>\n");
});

app.get("/login", (req, res) => {
  // console.log(req.body)
  templateVars = getTemplateVars(req);
  res.render("login", templateVars)
});

//Create new URL
app.get("/urls/new", (req, res) => {
  let templateVars = getTemplateVars(req);
  let userId = req.session.user_id;
  if (userId === undefined) {
    res.redirect("/login");
  } else {
    res.render("urls_new", templateVars);
  }
});

//"index"
app.get("/urls", (req, res) => {
  let templateVars = getTemplateVars(req);
  let userId = req.session.user_id;
  res.render("urls_index", templateVars);
});

//Login w/ cookie
app.post("/login", (req, res) => {
  let templateVars = getTemplateVars(req);
  let emailId = req.body.email;
  let user = getUserByEmail(emailId);
  console.log("login user object: ", user)
  let password = req.body.password;
  
  if (getUserByEmail(emailId) === false) {
    res.status(403);
    res.send("YOU SHALL NOT PASS: This email is not registered.")
  } else if (foundPassword(password) === false) {
      res.status(403);
      res.send("YOU SHALL NOT PASS: The email or password was incorrect");
      // console.log(foundPassword(password))
    } else if (foundPassword(password) === true) {
      console.log("login user object: ", user)
      req.session.user_id = user.user_id; 
      console.log("After setting of cookie ID in login", req.session.user_id)
      res.redirect('/urls');
    }
});

//Logout
app.post("/logout", (req, res) => {
  let userId = req.session.user_id;
  req.session = null;
  res.redirect('/urls');
});

//Create new url entry
app.post("/urls", (req, res) => {
  //change id length as num
  let num = 6;
  urlDatabase[generateRandomString(num)] = req.body.longURL;
  res.redirect('/url/' +  newShortUrl);
});

//If short URL clicked, redirect to actual site
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

//Short URL Page
app.get("/urls/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  let userId = req.session['userId'];
  let user = users[userId];
  let templateVars = {
    urls: urlDatabase,
    shortURL: shortURL,
    user: user,
   }
  // let templateVars = getTemplateVars(req);
  // console.log("shortURL templateVars: ", templateVars)
  // console.log("req: ", req.params.shortURL)
  res.render("urls_show", templateVars);
});

//Register Page
app.get("/register", (req, res) => {
  console.log("welcome to the register page!");
  templateVars = getTemplateVars(req);
  res.render("register", templateVars);
});

//Register new user form
app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  // console.log(hashedPassword);

  if ((email.length === 0) || (password.length === 0)) {
    res.status(400);
    res.send("YOU SHALL NOT PASS: you left something blank.");
  } else if (getUserByEmail(users, email)) {
    res.status(400);
    res.send("Sorry bub, you are already registered.");
  } else {

    //make new userID
    let num = 8; //length of random userID string
    let userId = generateRandomString(num);

    //set object from form data
    newUserObject = {
      user_id: userId,
      email: email,
      password: hashedPassword,
    },

    //write to users object from form data
    users[userId] = newUserObject;

    //set cookie from generated userId
    req.session.user_id = userId;
    console.log("session cookie id after registering: ", req.session.user_id);
    res.redirect('/urls');
  }
});

//Update longURL
app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect('/urls');
});

//Delete entry
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect('/urls');
});

// ===============================
//Server Setup and screen log
app.listen(PORT, () => {
  console.log(`Lloyd's Tiny App listening on port ${PORT}!`);
});

// ===============================
// Exports

module.exports = users;
console.log("express module exports: ", module.exports);