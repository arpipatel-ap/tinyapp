const express = require("express");
const cookieSession = require('cookie-session');
const {getUserByEmail, generateRandomString, urlsForUser  } = require("./helpers");
const { urlDatabase, users } = require("./database");
const bcrypt = require("bcryptjs");
const app = express();
const PORT = 8080;

app.set("view engine", "ejs");

// Middleware 
app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'nonsensical-value',
  keys: ['ajkdffgjsdfj'],
}));



// Route to display user's URLs
app.get("/urls", (req, res) => {
const userId = req.session["user_id"];
  if (!userId) {
    return res.status(403).send("You are not logged in");
  }
  const userUrls = urlsForUser(userId);
  const templateVars = {
    urls: userUrls,
    user: users[userId]
  };
  res.render("urls_index", templateVars);
});

//Route for json
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// Route to display form for creating a new URL
app.get("/urls/new", (req, res) => {
 const userId = req.session["user_id"];
  const user = users[userId];
  if(user){
    res.render("urls_new", { user: user });
  }else {
    res.redirect('/login');
  }
});

// Route to redirect short URLs to their corresponding long URLs
app.get("/u/:id", (req, res) => {
  const shortId = req.params.id;
  const url = urlDatabase[shortId];
  if(url){
    const longURL = url.longURL;
    res.redirect(longURL); 
  } else {
    res.status(404).send("<p>The short URL does not exist.</p>");
  }
});

// Route to update and delete specific urls
app.get("/urls/:id", (req, res) => {
  const userId = req.session["user_id"];
  if (!userId) {
    return res.status(401).send("You have to logged in to view this URL.");
  }
  const shortURL = req.params.id;
  const url = urlDatabase[shortURL]; 
  console.log("URL fetched:", url);
  if (!url) {
    return res.status(404).send("This short URL does not exist.");
  }
  if (!url.longURL) {
    return res.status(500).send("This URL entry is malformed.");
  }
  const longURL = url.longURL;
  const user = users[userId];
  if (url.userId !== userId) {
    return res.status(401).send("You do not have permission to view this URL.");
  }
  let templateVars = { 
    shortURL: shortURL,
    longURL: longURL,
    user: user 
  };
  res.render("urls_show", templateVars);
});


// Route to display login page
app.get('/login', (req, res) => {
  const userId = req.session["user_id"];
  if (userId) {
    res.redirect('/urls');
  } else {
    res.render('login',{user: null});
  }
});

// Route to display register page
app.get('/register', (req, res) => {
  const userId = req.session["user_id"];
  const user = users[userId];
  if (userId) {
    res.redirect('/urls');
  } else {
    res.render('register',{ user: null });
  }
});

//Route to handel new URL
app.post("/urls", (req, res) => {
  const userId = req.session["user_id"];
  const user = users[userId];
  if(user){
    const id = generateRandomString();
    const longURL = req.body.longURL;
    urlDatabase[id] = {
      longURL: longURL,
      userId: userId
    };
    res.redirect(`/urls/${id}`);
  }else {
    res.status(403).send("<p>You need to be logged in to shorten URLs.</p>");
  }
});

// Route to update a URL
app.post('/urls/:id/update', (req, res) => {
  const userId = req.session["user_id"];
  if (!userId) {
    return res.status(401).send("You must be logged in to update this");
  }
  const updateId = req.params.id;
  const url = urlDatabase[updateId];
  if (!url) {
    return res.status(404).send("The requested URL does not exist.");
  }
  if (url.userId !== userId) {
    return res.status(401).send("You do not have permission to edit this URL.");
  }
  const newLongURL = req.body.newLongURL;
  urlDatabase[updateId].longURL = newLongURL;
  res.redirect(`/urls/${updateId}`)
 });

// Route to update a URL
app.post('/urls/:id/delete', (req, res) => {
  const userId = req.session["user_id"];
  if (!userId) {
    return res.status(401).send("You have to  logged in to update this");
  }
  const urlsId = req.params.id;
  const url = urlDatabase[urlsId];
  if (!url) {
    return res.status(404).send("The requested URL does not exist.");
  }
  if (url.userId !== userId) {
    return res.status(401).send("You do not have permission to delete this URL.");
  }
  delete urlDatabase[urlsId];
  res.redirect('/urls');
});

// Route to Login page
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const user = getUserByEmail(email);
  if (!user) {
    return res.status(403).send("Invalid email or password");
  }else {
    const result = bcrypt.compareSync(password, user.password);
    if(result){
      res.cookie('user_id', user.id);
      res.redirect('/urls');
    }else {
      return res.status(403).send("password does not match");
    }
  }
});

// Route to Logout page
app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/urls');
});


// Route to register page
app.post('/register', (req, res) => {
  const {email, password} = req.body;
  if (!email || !password) {
    return res.status(400).send("Email and password are required");
  }
  if (getUserByEmail(email)) {
    return res.status(400).send("Email already exists");
  }
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(password, salt);
  const userId = generateRandomString();
  const user = {
    id: userId,
    email: email,
    password: hash
  };
  users[userId] = user;
  req.session.user_id = userId;
  res.redirect('/login');
});
app.get("/", (req, res) => {
  res.send("Hello");
});
  
//Server start
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
