//declaring resources

var express = require('express');
var app = express();
var PORT = process.env.PORT || 8080;

app.set('view engine', 'ejs');

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

const cookieParser = require('cookie-parser')
app.use(cookieParser())

var urlDatabase = {
  'b2xVn2': 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com'
};

const users = {}

function generateRandomString(length) {
  let randomString = '';
  let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (var i = 0; i < length; i++) {
    randomString += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return randomString;
}

//begin express

//register user
app.get('/register', (req, res) => {
  let templateVars = {username: req.cookies["username"]};
  res.render('register', templateVars)
});


//register a new user / assign them random string as key/ set their cookie
app.post('/register', (req, res) => {
  let user_id = generateRandomString(4);
  users[user_id] = {}; // set User id
  users[user_id].email = req.body['email'];
  users[user_id].password = req.body['password'];
  res.cookie('user_id', user_id);
  console.log(users);
  res.redirect('/urls')
});


//redirect from shortened url to full url
app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});


//renders url index page (shows all generated urls & can go to  edit/delete page)
app.get('/urls', (req, res) => {
  let templateVars = {urls: urlDatabase, username: req.cookies["username"]};
  res.render('urls_index', templateVars);
})


//renders new url page (user can generate short url from )
app.get("/urls/new", (req, res) => {
  let templateVars = {username: req.cookies["username"]}
  res.render("urls_new", templateVars);
});


//renders single url page. user can reassign shorturl to different longer url
app.get('/urls/:id', (req, res) => {
  let templateVars = {username: req.cookies["username"], shortURL: req.params.id, longURL: urlDatabase};
  res.render('urls_show', templateVars);
});


//generates 6 letter randomstring to assign to a long url
app.post("/urls", (req, res) => {
  urlDatabase[generateRandomString(6)] = req.body['longURL'];
  console.log(req.body);
  res.redirect('/urls');
});


//delete url
app.post('/urls/:id/delete', (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect('/urls');
});


//edit url; reassign a new long url to a short url
app.post('/urls/:id/edit', (req, res) => {
  urlDatabase[req.params.id] = req.body['reassignURL'];
  console.log(req.body['newURL'])
  res.redirect('/urls');
});


//redirect to registration page
app.get('/', (req, res) => {
  res.redirect('/register')
});


//render json
app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});


//redirect to registration page
app.get('/hello', (req, res) => {
  res.redirect('/register')
});


//user login / stores cookie
app.post('/login', (req, res) => {
  res.cookie('username', req.body['username']);
  console.log(req.body['username']);
  res.redirect('/urls')
});


//user logout / clears cookie
app.post('/logout', (req, res) => {
  res.clearCookie('username');
  res.redirect('/register')
});


//app is running!
app.listen(PORT, function() {
  console.log(`Example app listening on port ${PORT}`);
});








