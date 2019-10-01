
//Requirements
const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const cookie = require('cookie-parser');
const app = express();

//Port Setting
const PORT = 8080; // default port 8080

// App Settings
app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({extended: true}));
app.use(morgan(':method :url :status :response-time ms - :res[content-length]'))


let newShortUrl = "";

function generateRandomString(length) {
  length = 6;
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
   
  for (var i = 0; i < length; i++) {
    newShortUrl += possible.charAt(Math.floor(Math.random() * possible.length));
  } 
  return newShortUrl;
}

//Basic Url DB
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.send("Hello!");
});
//return db info as json
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//EE
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello there, and welcome to this Easter Egg.<b>World</b></body></html>\n");
});

//Create new URL
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

//"index"
app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

//Create new live only entry 
app.post("/urls", (req, res) => {
  urlDatabase[generateRandomString()] = req.body.longURL;
  // Object.assign(urlDatabase, {text :  storeURL});
  res.redirect('/url/' +  newShortUrl);
});

//If short URL clicked, redirect to actual site
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render("urls_show", templateVars);
});

//update longURL
app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  console.log(req.body.longURL);
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect('/urls');
})

//delete entry
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect('/urls');
});

//Server Setup and screen log
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});