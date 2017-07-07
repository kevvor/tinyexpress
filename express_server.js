//declaring resources

var express = require('express');
var app = express();
var PORT = process.env.PORT || 8080;

app.set('view engine', 'ejs');

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));

var cookieSession = require('cookie-session');
app.use(cookieSession({
  name: 'session',
  secret: 'secret',
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

const bcrypt = require('bcrypt');

const globalDatabase = {}; //global database to allow redirects from any where

const urlDatabase = {}; // database of all urls

const users = {}; // database of all users

function generateRandomString(length) { // generates a random string
  let randomString = '';
  let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (var i = 0; i < length; i++) {
    randomString += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return randomString;
}

//express

//register user
app.get('/register', (req, res) => {
  let templateVars = {user_id: req.session.user_id};
  res.render('register', templateVars);
});

//redirect from shortened url to full url
app.get('/u/:shortURL', (req, res) => {
  let longURL = globalDatabase[req.params.shortURL];
  res.redirect(longURL);
});

//renders url index page (shows all generated urls & can go to  edit/delete page)
app.get('/urls', (req, res) => {
  let loginCookie = req.session.user_id;
  if (!loginCookie) {
    res.redirect('/error');
  } else {
  let templateVars = {urls: urlDatabase, user_id: req.session.user_id, user: users[req.session.user_id]};
  res.render('urls_index', templateVars);
  };
});

//renders new url page (user can generate short url from )
app.get('/urls/new', (req, res) => {
  let loginCookie = req.session.user_id;
  if (!loginCookie) { //redirect to login if cookie not found
    res.redirect('/login');
  } else {
  let templateVars = {user_id: req.session.user_id, user: users[req.session.user_id]};
  res.render('urls_new', templateVars);
  };
});

//renders single url page. user can reassign shorturl to different longer url
app.get('/urls/:id', (req, res) => {
  let loginCookie = req.session.user_id;
  if (!loginCookie) {
    res.redirect('/login');
  } else {
  let templateVars = {user_id: req.session.user_id, shortURL: req.params.id, longURL: urlDatabase, user: users[req.session.user_id]};
  res.render('urls_show', templateVars);
  }
});

//redirect to registration page
app.get('/', (req, res) => {
  res.redirect('/register');
});

//render json
app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

//redirect to registration page
app.get('/hello', (req, res) => {
  res.redirect('/register');
});

app.get('/login', (req, res) => {
  res.render('urls_login');
});

//error page only has buttons to move user to login/register
app.get ('/error', (req, res) => {
  res.render('error');
});

//check for empty string
app.post('/register', (req, res) => {
  let newUser_id = generateRandomString(4);
  if (req.body['email'] === '' || req.body['password'] === '') {
    res.status(404).redirect('/error');
    return;
  }
// check if email has already been assigned
  for (let user_id in users) {
    if (users[user_id].email === req.body['email']) {
      res.status(404).redirect('/error');
      return;
    }
  }
//create new user set cookie and redirect to personalized urls page
  users[newUser_id] = {}; // set User id
  users[newUser_id].email = req.body['email']; // user email
  let password = req.body['password'];
  users[newUser_id].password = bcrypt.hashSync(password, 10); // user password
  req.session.user_id = newUser_id;
  res.redirect('/urls');
});

//generates 6 letter random string to assign to a long url
app.post('/urls', (req, res) => {
  let userID = req.session.user_id;
  let randomString = generateRandomString(6);
//create new entry for user if none exists
  if (!urlDatabase[userID]) {
    urlDatabase[userID] = {};
  }
//enter short:long url key"value pair
  urlDatabase[userID][randomString] = req.body['longURL'];
  globalDatabase[randomString] = req.body['longURL']; //asign same key:value to global database
  res.redirect('/urls');
});

//delete url
app.post('/urls/:id/delete', (req, res) => {
  delete urlDatabase[req.session.user_id][req.params.id]; // delete from both databases
  delete globalDatabase[req.params.id];
  res.redirect('/urls');
});

//edit url; reassign a new long url to a short url
app.post('/urls/:id/edit', (req, res) => {
  let loginCookie = req.session.user_id;
  urlDatabase[loginCookie][req.params.id] = req.body['reassignURL'];
  globalDatabase[req.params.id] = req.body['reassignURL'];
  res.redirect('/urls');
});

//user login / stores cookie
app.post('/login', (req, res) => {
  for (let user_id in users) {
//loop through users to check if email and pass match
    if (users[user_id].email === req.body['email'] && bcrypt.compareSync(req.body['password'], users[user_id].password)) {
      req.session.user_id = user_id;
      res.redirect('/urls');
      return;
    }
  }
//if email/pass don't match send to error page
  res.redirect('/error');
});


//user logout / clears cookie
app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/urls');
});



//app is running!
app.listen(PORT, function() {
  console.log(`Example app listening on port ${PORT}`);
});








