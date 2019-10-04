
//Requirements
const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session');
const app = express();
const bcrypt = require('bcrypt');
const { getUserByEmail } = require('./helpers.js');

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
const foundPassword = function(users, passwordId) {
  for (let key in users) {
    if (bcrypt.compareSync(passwordId, users[key].password) === true) {
      return true;
    }
  }
  return false;
};

// Const TempplateVars temnplate for most functions
const getTemplateVars = function(req) {
  let userId = req.session.user_id;
  let user = users[userId];
  let templateVars = {
    urls: urlDatabase,
    urlsforUserId: urlsForUser(userId),
    user: user
  };
  return templateVars;
};

//returns array of object urls based on userId (cookie id)
const urlsForUser = function(id) {
  let urlIds = [];
  for (let key in urlDatabase) {
    if (urlDatabase[key].user_id === id) {
      urlIds.push(urlDatabase[key]);
    }
  }
  return urlIds;
  console.log(urlIds);
};

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
  res.redirect("/login");
});

//EE
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello there, and welcome to this Easter Egg.<b>World</b></body></html>\n");
});

app.get("/login", (req, res) => {
  let templateVars = getTemplateVars(req);

  res.render("login", templateVars);
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

  if (userId === undefined) {
    res.send('Please <a href=./login>login</a> to see this content.');
  } else {
    res.render("urls_index", templateVars);
  }
});

//Login w/ cookie
app.post("/login", (req, res) => {
  let templateVars = getTemplateVars(req);
  let emailId = req.body.email;
  let user = getUserByEmail(emailId);
  let password = req.body.password;
  
  if (getUserByEmail(users, emailId) === false) {
    res.status(403);
    res.send("YOU SHALL NOT PASS: This email is not registered. Please register <a href=./register>here</a>.");

  } else if (foundPassword(users, password) === false) {
    res.status(403);
    res.send("YOU SHALL NOT PASS: The email or password was incorrect");

  } else if (foundPassword(users, password) === true) {
    req.session.user_id = user.user_id;
    res.redirect('/urls');
  }
});

//Logout - null cookie
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect('/urls');
});

//Create new url entry
app.post("/urls", (req, res) => {
  //change id length as num
  let num = 6;
  let newShortUrl = generateRandomString(num);

  urlDatabase[newShortUrl] = { 
    shortURL: newShortUrl,
    longURL: req.body.longURL,
    user_id: req.session.user_id,
  } 
  res.redirect('/urls/' +  newShortUrl);
});

//If ultra short URL visited (u), redirect to actual site
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

//Short URL Page
app.get("/urls/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  let userId = req.session.user_id;
  let user = users[userId];
  let templateVars = {
    urls: urlDatabase,
    shortURL: shortURL,
    user: user,
  };

  if (userId === undefined) {
    res.send('Please <a href=./login>login</a> to see this content.');

  } else if (userId !== urlDatabase[shortURL].user_id) {
    res.send('These aren\'t the droids you\'re looking for.... Unfortunately this content was not created by you.  Please trying creating a new URL!');

  } else {
    res.render("urls_show", templateVars);
  }
});

//Register Page
app.get("/register", (req, res) => {
  console.log("welcome to the registration page!");
  let templateVars = getTemplateVars(req);
  res.render("register", templateVars);
});

//Register new user form
app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);

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
    const newUserObject = {
      user_id: userId,
      email: email,
      password: hashedPassword,
    };

    //write to users object from form data
    users[userId] = newUserObject;

    //set cookie from generated userId
    req.session.user_id = userId;
    res.redirect('/urls');
  }
});

//Update longURL
app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
  }
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
