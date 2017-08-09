var express = require("express");
var app = express();
var PORT = process.env.PORT || 8080;
var cookieSession = require("cookie-session");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");

var urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "Admin"
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
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
};

const emailLookUp = (email) => {
  for (let userId in users) {
    if(users[userId].email === email) {
      return true;
    }
  }
};

const userFinder = (email) => {
  for (let userId in users) {
    if(users[userId].email === email) {
      return users[userId];
    }
  }
};

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
      // console.log("id found");
      urlUser[url_id] = urlDatabase[url_id];
    }
  }
  // console.log(urlUser);
  return urlUser;
}

app.listen(PORT, () => {
  console.log(`TinyURL app listening on port ${PORT}!`);
});

app.use(cookieSession({
  name: 'session',
  keys: ["sdnfldnslfnsdlkfklndslkfnlks"]}));
app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");

app.get("/", (req, res) => {
  if (!req.session.user_id) {
    res.redirect('/login');
  } else {
    res.redirect("/urls");
  }
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls/new", (req, res) => {
  const user = req.session.user_id;
  if (user) {
    let templateVars = {
      username: req.session.user_id,
      users: users,
      urls: urlDatabase
    };
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

app.post("/urls", (req, res) => {
  // console.log(req.body);
<<<<<<< HEAD
  let longURL = req.body.longURL;
  if (!longURL.includes("http://")) {
    console.log("does not have http://");
    longURL = "http://" + longURL
  } // ensure longURL always have http:// in it before database
  let uid = generateRandomString();
  urlDatabase[uid] = {longURL: longURL, userID: req.session.user_id};
=======
  let uid = generateRandomString();
  urlDatabase[uid] = {longURL: req.body.longURL, userID: req.session.user_id};
>>>>>>> 14936e18d6e7489fc7e61f03eb25b88749b7af70
  let templateVars = { username: req.session.user_id,
    shortURL: req.params.id,
    urls: urlDatabase,
    user: users[req.session.user_id]};
  res.redirect("/urls/" + uid);
});

app.get("/urls", (req, res) => {
  // console.log(req.session);
  const username = req.session.user_id;
  // console.log(username);
  var urls = urlsForUserID(username);
  let templateVars = { username: username,
    urls: urls,
    users: users
  };
  res.render("urls_index", templateVars);
});

app.get("/login", (req, res) =>{
  if (userFinder(req.session.user_id)){
    res.redirect('/urls');
  } else {
    let templateVars = {username: req.session.user_id,
      shortURL: req.params.id,
      urls: urlDatabase,
      users: users,
      user: users[req.session.user_id]};
    res.render('login', templateVars);
  }
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
  let templateVars = {username: req.session.user_id,
    shortURL: req.params.id,
    urls: urlDatabase,
    users: users,
    user: users[req.session.user_id]};
  res.render("urls_show", templateVars);
});

app.post("/urls/:id", (req, res) => {
  var longURL = urlDatabase[req.params.id].longURL;
  const shortURL = req.params.id;
<<<<<<< HEAD
  // console.log(urlDatabase[req.params.id].longURL);
=======
>>>>>>> 14936e18d6e7489fc7e61f03eb25b88749b7af70
  if (urlDatabase[shortURL]["userID"] === req.session.user_id){
    urlDatabase[req.params.id].longURL = req.body.longURL;
    res.redirect("/urls");
  }
});

app.post("/urls/:id/delete", (req, res) => {
  const shortURL = req.params.id;
  if (urlDatabase[shortURL]["userID"] === req.session.user_id){
    delete urlDatabase[req.params.id];
  }
  res.redirect("/urls");
});

app.post("/urls/:id/delete", (req, res) => {
  const shortURL = req.params.id;
  if (urlDatabase[shortURL]["userID"] === req.session.user_id){
    delete urlDatabase[req.params.id];
  }
  res.redirect("/urls");
});

app.get("/register", (req, res) => {
  if (userFinder(req.session.user_id)){
    res.redirect("/urls");
  } else {
    let templateVars = {username: req.session.user_id,
      shortURL: req.params.id,
      urls: urlDatabase,
      users: users,
      user: users[req.session.user_id]};
    res.render("reg", templateVars);
  }
});

app.post("/register", (req, res) => {
  const uid = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  if ((email === "") || (password === "")) {
    res.status(400).send("Bad Request");
  } else if (emailLookUp(email)){
    res.status(400).send("Email already in use");
  } else {
    users[uid] = {id: uid,
      email: email,
      password: bcrypt.hashSync(password, 10)
    };
  }
  req.session.user_id = uid;
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  req.session.user_id = null;
  res.redirect("/urls");
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
<<<<<<< HEAD
  res.redirect(longURL);
=======
  res.redirect("/longURL");
>>>>>>> 14936e18d6e7489fc7e61f03eb25b88749b7af70
});

app.get("/hello", (req, res) => {
  res.end("<html><body>Hello <b>World</b></body></html>\n");
});
