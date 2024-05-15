const express = require("express");
const app = express();
const PORT = 8080;

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));
function generateRandomString() {
  return Math.random().toString(36).substring(2, 8);
}
const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};


app.get("/urls",(req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/", (req, res) => {
  res.send("Hello");
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


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});





