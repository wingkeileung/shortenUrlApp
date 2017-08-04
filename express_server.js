var express = require("express");
var app = express();
var PORT = process.env.PORT || 8080;
// var cookieParser = require("cookie-parser");
var cookieSession = require("cookie-session");
var express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");

var urlDatabase = {
  "b2xVn2": {
    address: "http://www.lighthouselabs.ca",
    shortURL: "b2xVn2",
    userID: "Admin"
  },
  "9sm5xK": {
    address: "http://www.google.com",
    shortURL: "9sm5xK",
    userID: "Admin"
  }
};
const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: bcrypt.hashSync("purple-monkey-dinosaur", 10)
  },
 "23423j": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("dishwasher-funk", 10)
  }
}

const emailLookUp = (email) => {
  for (let userId in users) {
    if(users[userId].email === email) {
      return true;
    }
  }
}

const userFinder = (email) => {
 for (let userId in users) {
   if(users[userId].email === email) {
     return users[userId];
   }
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

function urlsForUserID(id) {
  var urlUser = {};
  for (var url_id in urlDatabase) {
    if (urlDatabase[url_id].userID === id) {
      urlUser[url_id] = urlDatabase[url_id];
    }
  }
  return urlUser;
}

app.use(cookieSession({
  name: 'session',
  keys: ["sdnfldnslfnsdlkfklndslkfnlks"]}));
// app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");

app.get("/", (req, res) => {
  let templateVars = { urls: urlDatabase,
                       user_id: users[req.session.user_id]
  };
  res.end("Hello!");
});


app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls/new",(req, res) => {
  const user = req.session.user_id;
  console.log(user)
  console.log('helllooooo')
  console.log(req.session)
  if (user) {
    let templateVars = {
      user: req.session.user_id
    };
    console.log (urlDatabase)
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

app.post("/urls", (req, res) => {
  console.log(req.body);
  let uid = generateRandomString();
  urlDatabase[uid] = {address: req.body.longURL,
                      userID: req.session.user_id,
                      shortURL: uid}
  res.redirect("/urls/"+uid);
});

app.get("/urls", (req, res) => {
  const userCookie = req.session.user_id;
  var urls = urlsForUserID(userCookie)
  let templateVars = { user: userCookie,
                       urls: urls};
  res.render("urls_index", templateVars);
});

app.get('/login', (req, res) =>{
  let templateVars = {  username: req.session.user_id,
                        urls: urlDatabase,
                        user: users[req.session.user_id]};
  res.render("login", templateVars);
});

app.post("/login", (req, res) => {
  const email  = req.body.email;
  const password = req.body.password;
  const user = userFinder(email, password);
  // console.log("testing for account for user -", user)
  if (!user) {
    res.status(403).send("User doesn't exists in data base");
  }
  if (user) {
    // console.log(user.password)
    if(bcrypt.compareSync(password, user.password)){
      console.log(user.password);
      req.session.user_id = user.id;
      res.redirect("/urls");
    } else {
      res.status(403).send("Wrong Password!!!!");
    }
  }
});

app.get("/urls/:id", (req, res) => {
 let templateVars = { username: req.session.user_id,
                      shortURL: req.params.id,
                      urls: urlDatabase,
                      user: users[req.session.user_id]};
 res.render("urls_show", templateVars);
});

app.post("/urls/:id", (req, res) => {
  var longURL = urlDatabase[req.params.id].address;
  const shortURL = req.params.id;
  console.log("longURL", longURL);
  console.log("shorturl", shortURL);
  console.log(urlDatabase[req.params.id].address)
  console.log("urldb[surl][userid]",urlDatabase[shortURL]['userID'])
  console.log(req.body.longURL);
  if (urlDatabase[shortURL]["userID"] === req.session.user_id){
    urlDatabase[req.params.id].address = req.body.longURL;
    res.redirect("/urls");
  }
});

app.post("/urls/:id/delete", (req, res) => {
  const shortURL = req.params.id;
  if (urlDatabase[shortURL]["userID"] === req.session.user_id){
    delete urlDatabase[req.params.id];
  }
  res.redirect("/urls");
})

app.post("/urls/:id/delete", (req, res) => {
    const shortURL = req.params.id;
    if (urlDatabase[shortURL]["userID"] === req.session.user_id){
      delete urlDatabase[req.params.id];
  }
  res.redirect("/urls");
});

app.get("/register", (req, res) => {
let templateVars = {username: req.session.user_id,
                    urls: urlDatabase,
                    user: users[req.session.user_id]};
  res.render("reg", templateVars);
});

app.post("/register", (req, res) => {
  const uid = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  console.log(req.body);
  if ((email === "") || (password === "") || emailLookUp(email)) {
    res.status(400).send("Bad Request");
  } else {
    users[uid] = {
      id: uid,
      email: email,
      password: bcrypt.hashSync(password, 10)
      }
    };
req.session.user_id = uid;
  console.log(users);
res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  req.session.user_id = null;
  res.redirect("/urls");
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].address;
  res.redirect("/longURL");
});

app.get("/hello", (req, res) => {
  res.end("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log("TinyURL app listening on port ${PORT}!");
});

