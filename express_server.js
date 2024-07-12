
const express = require("express");
const app = express();
const PORT = 8080;

app.set("view engine", "ejs");

const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');

const { getUserByEmail, urlsForUser } = require('./helpers');


app.use(bodyParser.urlencoded({ extended: true }));

app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));

const generateRandomString = function() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};

const users = {};


app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const user = getUserByEmail(email, users);

  if (!user) {
    return res.status(403).send("Email cannot be found.");
  }

  if (!bcrypt.compareSync(password, user.password)) {
    return res.status(403).send("Incorrect password.");
  }

  req.session.user_id = user.id;
  res.redirect("/urls");
});

app.post("/register", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send("Email and password cannot be empty.");
  }

  if (getUserByEmail(email, users)) {
    return res.status(400).send("Email already registered.");
  }

  const userId = generateRandomString();
  const hashedPassword = bcrypt.hashSync(password, 10);

  users[userId] = {
    id: userId,
    email,
    password: hashedPassword
  };

  req.session.user_id = userId;
  res.redirect("/urls");
});

app.get("/", (req, res) => {
  res.redirect("/login");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  const userId = req.session.user_id;
  if (!userId) {
    return res.status(403).send("Please log in or register to view URLs.");
  }
  const userUrls = urlsForUser(userId, urlDatabase);
  const user = users[userId];
  const templateVars = { user, urls: userUrls };
  res.render("urls_index", templateVars);
});


app.get("/urls/new", (req, res) => {
  const userId = req.session.user_id;
  if (!userId) {
    return res.redirect("/login");
  }
  const user = users[userId];
  const templateVars = { user };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const userId = req.session.user_id;
  if (!userId) {
    return res.status(403).send("Please log in to view this URL.");
  }
  const url = urlDatabase[req.params.id];
  if (!url) {
    return res.status(404).send("Short URL not found.");
  }
  if (url.userID !== userId) {
    return res.status(403).send("You do not own this URL.");
  }
  const user = users[userId];
  const templateVars = { id: req.params.id, longURL: url.longURL, user };
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  const userId = req.session.user_id;
  if (!userId) {
    return res.status(403).send("You must be logged in to create new URLs.");
  }
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: userId,
  };
  res.redirect(`/urls/${shortURL}`);
});

app.get("/u/:id", (req, res) => {
  const url = urlDatabase[req.params.id];
  if (!url) {
    return res.status(404).send("Short URL not found.");
  }
  res.redirect(url.longURL);
});

app.post("/urls/:id/delete", (req, res) => {
  const userId = req.session.user_id;
  if (!userId) {
    return res.status(403).send("You must be logged in to delete URLs.");
  }
  const url = urlDatabase[req.params.id];
  if (!url) {
    return res.status(404).send("Short URL not found.");
  }
  if (url.userID !== userId) {
    return res.status(403).send("You do not own this URL.");
  }
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

app.post("/urls/:id", (req, res) => {
  const userId = req.session.user_id;
  if (!userId) {
    return res.status(403).send("You must be logged in to edit URLs.");
  }
  const url = urlDatabase[req.params.id];
  if (!url) {
    return res.status(404).send("Short URL not found.");
  }
  if (url.userID !== userId) {
    return res.status(403).send("You do not own this URL.");
  }
  urlDatabase[req.params.id].longURL = req.body.longURL;
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});

app.get("/register", (req, res) => {
  const userId = req.session.user_id;
  if (userId) {
    return res.redirect("/urls");
  }
  const user = users[userId];
  const templateVars = { user };
  res.render("register", templateVars);
});

app.get("/login", (req, res) => {
  const userId = req.session.user_id;
  if (userId) {
    return res.redirect("/urls");
  }
  const user = users[userId];
  const templateVars = { user };
  res.render("login", templateVars);
});

app.get("/users", (req, res) => {
  res.json(users);
});
