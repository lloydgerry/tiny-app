

const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const app = express();
const PORT = 8080; // default port 8080


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


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.send("Hello!");
});
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  urlDatabase[generateRandomString()] = req.body.longURL;
  // Object.assign(urlDatabase, {text :  storeURL});
  res.redirect('/url/' +  newShortUrl);
});

app.get("/u/:shortURL", (req, res) => {
  console.log(req.params.shortURL);
  console.log(urlDatabase[req.params.shortURL]);
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get("/url/:shortURL", (req, res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render("urls_show", templateVars);
});

app.post("/url/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});