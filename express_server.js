const express = require("express");
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080;

app.set("view engine", "ejs");
//add middleware
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

function generateRandomString() {
  return Math.random().toString(36).substring(2, 8);
}
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

//helper function by email
function getUserByEmail(email) {
  for (const userId in users) {
    if (users[userId].email === email) {
      return users[userId];
    }
  }
  return null;
}
function urlsForUser(id) {
  const userUrls = {};
  for (const urlId in urlDatabase) {
    if (urlDatabase[urlId].userID === id) {
      userUrls[urlId] = urlDatabase[urlId];
    }
  }
  return userUrls;
}

app.get("/", (req, res) => {
  res.send("Hello");
});

//cookies
app.get("/urls", (req, res) => {
  
const userId = req.cookies["user_id"];
  if (!userId) {
    return res.status(403).send("You are not logged in");
  }
  


  const userUrls = urlsForUser(userId);
  const templateVars = {
    urls: userUrls,
    user: users[userId]
  };
  console.log(templateVars);
  res.render("urls_index", templateVars);
});


app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});


app.get("/urls/new", (req, res) => {
  const userId = req.cookies["user_id"];
  const user = users[userId];
  if(user){
    res.render("urls_new", { user: user });
  }else {
    res.redirect('/login');
  }
 
});

app.get("/u/:id", (req, res) => {
  const shortId = req.params.id;
  const url = urlDatabase[shortId];
  //const templateVars = { id: shortId, longURL: urlDatabase[shortId]};
  //res.render("urls_show", templateVars);
  if(url){
    const longURL = url.longURL;
    res.redirect(longURL);
    console.log(longURL)
  }else {
    res.status(404).send("<p>The short URL does not exist.</p>");
  }
});

//update delete
app.get("/urls/:id", (req, res) => {
  const userId = req.cookies["user_id"];
  if (!userId) {
    return res.status(401).send("You have to logged in to view this URL.");
  }
  const shortURL = req.params.id;
  const url = urlDatabase[shortId]; 
  const longURL = urlDatabase[shortURL];
  const user = users[userId];

  if(!url){
    return res.status(401).send("This URL doesn't exsit");
  }

  if (url.userID !== userId) {
    return res.status(401).send("You do not have permission to view this URL.");
  }
  
  let templateVars = { 
    shortURL: shortURL,
    longURL: longURL,
    user: user 
  };
  res.render("urls_show", templateVars);
  
});

//Login
app.get('/login', (req, res) => {
  const userId = req.cookies["user_id"];
  if (userId) {
    res.redirect('/urls');
  } else {
    res.render('login',{user: null});
  }
});

//Register
app.get('/register', (req, res) => {
  const userId = req.cookies["user_id"];
  const user = users[userId];
  if (userId) {
    res.redirect('/urls');
  } else {
    res.render('register',{ user: null });
  }
  
  
});


//all post/ request

app.post("/urls", (req, res) => {
  const userId = req.cookies["user_id"];
  if(user){
    const id = generateRandomString();
    const longURL = req.body.longURL;
    urlDatabase[id] = longURL;
    res.redirect(`/urls/${id}`);
  }else {
    res.status(403).send("<p>You need to be logged in to shorten URLs.</p>");
  }
});


// POST /products/:id/update
app.post('/urls/:id/update', (req, res) => {
  const userId = req.cookies["user_id"];
  if (!userId) {
    return res.status(401).send("You must be logged in to update this");
  }
  const updateId = req.params.id;
  const url = urlDatabase[updateId];

  if (!url) {
    return res.status(404).send("The requested URL does not exist.");
  }
  
  if (url.userID !== userId) {
    return res.status(401).send("You do not have permission to edit this URL.");
  }

  const newLongURL = req.body.newLongURL;
  urlDatabase[updateId].longURL = newLongURL;
  res.redirect(`/urls/${updateId}`)
  
 });
//DELETE DATA
app.post('/urls/:id/delete', (req, res) => {
  const userId = req.cookies["user_id"];
  if (!userId) {
    return res.status(401).send("You have to  logged in to update this");
  }
  const urlsId = req.params.id;
  const url = urlDatabase[urlsId];

  if (!url) {
    return res.status(404).send("The requested URL does not exist.");
  }
  
  if (url.userID !== userId) {
    return res.status(401).send("You do not have permission to delete this URL.");
  }

  delete urlDatabase[urlsId];
  res.redirect('/urls');
});

//Login Post
app.post('/login', (req, res) => {
  const { email, password } = req.body;
 
  const user = getUserByEmail(email);

  if (!user || user.password !== password) {
    return res.status(403).send("Invalid email or password");
  }
  res.cookie('user_id', user.id);

  res.redirect('/urls');
});

//Logout
app.post('/logout', (req, res) => {
  res.clearCookie('user_id'); 
  res.redirect('/urls'); // Redirect to the homepage or wherever appropriate
});


//Register handler

app.post('/register', (req, res) => {
  const {email, password} = req.body;
  // Check if the email and password are empty string
  if (!email || !password) {
    return res.status(400).send("Email and password are required");
  }

  // Check if the email already exists in the users object
  if (getUserByEmail(email)) {
    return res.status(400).send("Email already exists");
  }

  const userId = generateRandomString();
 
  const user = {
    id: userId,
    email: email,
    password: password
  };

  users[userId] = user;
  console.log(user);

  res.cookie('user_id', userId);

  res.redirect('/urls/login');
});
  


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});







  // const templateVars = {
  //   urls: urlDatabase,
  // //  username: req.cookies["username"],
  //   user: users[userId]
  // };
  // console.log(templateVars);