const express = require("express");
const cookieSession = require('cookie-session');
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
// Function to generate a random string for short URLs
function generateRandomString() {
  return Math.random().toString(36).substring(2, 8);
}
// Database for storing short URLs
const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userId: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userId: "aJ48lW",
  },
};

const users = {
  aJ48lW: {
    id: "aJ48lW",
    email: "d@d.com",
    password: "$2a$10$ACMv/2f6oOkHKQUHo4VIQuXgvVBmkgY8l00DelShy6NwV2WohvWka"
  }
};

// Function to retrieve a user by their email
function getUserByEmail(email) {
  
  for (let userId in users) {
    if (users[userId].email === email) {
      return users[userId];
    }
  }
  return null;
}

// Function to retrieve URLs associated with a specific user
function urlsForUser(id) {
  const userUrls = {};
  
  for (let urlId in urlDatabase) {
    
    if (urlDatabase[urlId].userId === id) {
      userUrls[urlId] = urlDatabase[urlId];
    }
  }
  console.log(userUrls);
  
  return userUrls;
}

app.get("/", (req, res) => {
  res.send("Hello");
});

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
    
  }else {
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
  const longURL = urlDatabase[shortURL].longURL;
  const user = users[userId];
  

  if(!url){
    return res.status(401).send("This URL doesn't exsit");
  }

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
  req.session.user_id = null;
  res.redirect('/urls'); // Redirect to the homepage or wherever appropriate
});


// Route to register page
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
  

//Server start
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});







