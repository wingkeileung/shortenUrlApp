var express = require("express");
var cookieParser = require('cookie-parser');
var app = express();
var PORT = process.env.PORT || 8080;

var urlDatabase = {
 "b2xVn2": {
    address: "http://www.lighthouselabs.ca",
    userID: "userRandomID"
  },
 "9sm5xK": {
    address: "http://www.google.com",
    userID: "user2RandomID"
}};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
}

function generateRandomString() {
  let uid = "";
  let charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  for(var i = 0; i < 6; i++) {
    uid += charset.charAt(Math.floor(Math.random() * charset.length));
  }
 return uid;
}

const bodyParser = require("body-parser");
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");

app.get("/", (req, res) => {
  let templateVars = { urls: urlDatabase,
                       user_id: users[req.cookies['user_id']]};
  res.end("Hello! ");
});

app.get("/urls.json", (req, res) => {
  let templateVars = { urls: urlDatabase,
                       user_id: users[req.cookies['user_id']]};
  res.json(urlDatabase);
});

app.get("/urls/new", (req, res) => {
  let templateVars = { user_id: users[req.cookies['user_id']] }
  if (users.hasOwnProperty(req.cookies['user_id'])){
    res.render("urls_new", templateVars);
  }
  else {
    res.redirect("/login");
  }
});

app.post("/urls", (req, res) => {
  const uid = generateRandomString();
  const user = req.cookies['user_id'];
  const url = req.body.longURL;
  urlDatabase[uid] = { address: url, userID: user };
  console.log(urlDatabase);
  res.redirect('/urls/' + uid);
});

app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase,
                       user_id: users[req.cookies['user_id']]};
  res.render("urls_index", templateVars);
});

app.get('/login', (req, res) =>{
  let templateVars = {  shortURL: req.params.id,
                        urls: urlDatabase,
                        user_id: users[req.cookies['user_id']]};
  res.render("login", templateVars);
});

const emailChecker = (email) => {
  for (let userID in users) {
    if (users[userID].email === email) {
      return userID;
    }
  }
}

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const user = emailChecker(email, password);
  if (!user) {
    res.status(403).send("User doesn't exists in data base");
  }
  if (user) {
    console.log('after passthru user', password);
    console.log('users password', users[user].password);
    if(users[user].password === password) {
      res.cookie( "user_id", user.id );
      res.redirect('/urls');
    } else {
      res.status(403).send("Wrong Password!!!!")
    }
  }
});

app.get("/urls/:id", (req, res) => {
  const userCookie = req.cookies['user_id'];
  console.log(userCookie);
  if (!userCookie) {
    res.redirect("/login");
  } else {
    console.log("USERS");
    const user = users[userCookie];
    const id = req.params.id;
    let templateVars = { shortURL: id,
                         urls: urlDatabase,
                         user_id: user };
    res.render("urls_show", templateVars);
  }
});

app.post("/urls/:id", (req, res) => {
  var longURL = urlDatabase[req.params.id].address;
  const shortURL = req.params.id
  if(urlDatabase[shortURL]["user_id"] = req.cookies["user_id"]){
    urlDatabase[req.params.id].address = req.body.longURL;
    res.redirect('/urls');
  }
});

app.post("/urls/:id/delete", (req, res) => {
    const shortURL = req.params.id;
    if (urlDatabase[shortURL]["user_id"]= req.cookies["user_id"]){
      delete urlDatabase[req.params.id];
    res.redirect("/urls")
    }
    else {
    res.redirect("/urls")
  }
});

app.get("/register", (req, res) => {
let templateVars = {  shortURL: req.params.id,
                        urls: urlDatabase,
                        user_id: users[req.cookies['user_id']]};
  res.render("reg", templateVars);
});

app.post("/register", (req, res) => {
  const uid = generateRandomString();
  const { email, password } = req.body;

  if ((email === "") || (password === "") || emailChecker()) {
    res.sendStatus(400);
  } else {
  users[uid] = {
    user_id: uid,
    email: req.body.email,
  password: req.body.password
  }};
res.cookie("user_id", users[uid].user_id);
  console.log(users);
res.redirect("/urls");
});


app.post("/logout", (req, res) => {
  res.clearCookie("user_id")
  res.redirect("/login")
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect("/longURL");
});

app.get("/hello", (req, res) => {
  res.end("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`TinyURL app listening on port ${PORT}!`);
});