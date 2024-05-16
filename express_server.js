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
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
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

app.get("/", (req, res) => {
  res.send("Hello");
});
//cookies
app.get("/urls", (req, res) => {
  
  const userId = req.cookies["user_id"];
  
  const templateVars = {
    urls: urlDatabase,
  //  username: req.cookies["username"],
    user: users[userId]
  };
  console.log(templateVars);
  res.render("urls_index", templateVars);
});


app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// app.get("/hello", (req, res) => {
//   res.send("<html><body>Hello <b>World</b></body></html>\n");

// });
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/u/:id", (req, res) => {
  const shortId = req.params.id
  const templateVars = { id: shortId, longURL: urlDatabase[shortId]};
  //res.render("urls_show", templateVars);
  const longURL = urlDatabase[req.params.shortURL]
  res.redirect(longURL)
});

app.get("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  const longURL = urlDatabase[shortURL];
  //  console.log("Hello", shortURL);
  //  console.log("Enter", longURL);
 
  let templateVars = { shortURL: shortURL, longURL: longURL};
  res.render("urls_show", templateVars);
  
});


//Register
app.get('/register', (req, res) => {
  res.render('urls_register');
});


//all post/ request

app.post("/urls", (req, res) => {
  const id = generateRandomString();
  const longURL = req.body.longURL;
  urlDatabase[id] = longURL;
  res.redirect(`/urls/${id}`);
});


// POST /products/:id/edit
app.post('/urls/:id/update', (req, res) => {
  const updateId = req.params.id;
 
  const newLongURL = req.body.newLongURL;

  urlDatabase[updateId] = newLongURL;
  
  res.redirect(`/urls/${updateId}`)
//   const price = Number(req.body.price);  

 });
//DELETE DATA
app.post('/urls/:id/delete', (req, res) => {
  const urlsId = req.params.id; 

  delete urlDatabase[urlsId];

  res.redirect('/urls');
});

//Login Post
app.post('/urls/login', (req,res) => {
  const username = req.body.username;  
  //console.log(username);
  res.cookie('username', username);
  res.redirect('/urls');
});

//Logout
app.post('/logout', (req, res) => {
  res.clearCookie('user'); // Clear the username cookie
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

  res.redirect('/urls');
});
  


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});





