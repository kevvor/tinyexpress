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
  aaaa: {
  'b2xVn2': 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com'
  }
};

const users = {
  aaaa: {email: 'test@email.com',
        password: 'pwd'}
}

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
  let templateVars = {user_id: req.cookies["user_id"]};
  res.render('register', templateVars)
});


//register a new user / assign them random string as key/ set their cookie
app.post('/register', (req, res) => {
  let newUser_id = generateRandomString(4);

  if (req.body['email'] === '' || req.body['password'] === '') {
    res.status(404).redirect('/error');
    return;
  }
  for (let user_id in users) {
    if (users[user_id].email === req.body['email']) {
      res.status(404).redirect('/error');
      return;
    }
  }
  users[newUser_id] = {}; // set User id
  users[newUser_id].email = req.body['email']; // user email
  users[newUser_id].password = req.body['password']; // user password
  console.log(users)
  res.cookie('user_id', newUser_id);
  res.redirect('/urls')
});


//redirect from shortened url to full url
app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});


//renders url index page (shows all generated urls & can go to  edit/delete page)
app.get('/urls', (req, res) => {
  let templateVars = {urls: urlDatabase, user_id: req.cookies["user_id"]};
  res.render('urls_index', templateVars);
});


//renders new url page (user can generate short url from )
app.get("/urls/new", (req, res) => {
  let loginCookie = req.cookies['user_id']
  if (!loginCookie) { //redirect to login if cookie not found
    res.redirect('/login');
  } else {
  let templateVars = {user_id: req.cookies["user_id"]}
  res.render("urls_new", templateVars);
  };
});


//renders single url page. user can reassign shorturl to different longer url
app.get('/urls/:id', (req, res) => {
  let templateVars = {user_id: req.cookies["user_id"], shortURL: req.params.id, longURL: urlDatabase};
  let loginCookie = req.cookies['user_id']
  if (!loginCookie) {
    res.redirect('/login');
  } else {
  res.render('urls_show', templateVars);
  }
});


//generates 6 letter random string to assign to a long url
app.post("/urls", (req, res) => {
  let userID = req.cookies['user_id']
  let randomString6 = generateRandomString(6);
  if (!urlDatabase[userID]) {
    urlDatabase[userID] = {};
  }
  urlDatabase[userID][randomString6] = req.body['longURL'];
  res.redirect('/urls');
  console.log(urlDatabase);
});


//delete url
app.post('/urls/:id/delete', (req, res) => {
  let loginCookie = req.cookies['user_id'];
  delete urlDatabase[loginCookie][req.params.id];
  res.redirect('/urls');
});


//edit url; reassign a new long url to a short url
app.post('/urls/:id/edit', (req, res) => {
  let loginCookie = req.cookies['user_id'];
  urlDatabase[loginCookie][req.params.id] = req.body['reassignURL'];
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

app.get('/login', (req, res) => {
  res.render('urls_login')
})

//user login / stores cookie
app.post('/login', (req, res) => {
  for (let user_id in users) {
    if (users[user_id].email === req.body['email'] && users[user_id].password === req.body['password']) {
      res.cookie('user_id', user_id)
      res.redirect('/urls');
      return;
    }
  }
  res.redirect('/login');
});


//user logout / clears cookie
app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/login')
});

app.get ('/error', (req, res) => {
  res.render('error')
});

app.post('/error', (req, res) => {
  for (let user_id in users) {
    if (users[user_id].email === req.body['email'] && users[user_id].password === req.body['password']) {
      res.cookie('user_id', user_id)
      res.redirect('/urls');
    }
    else {
      res.redirect('/login')
    }
  }
});

//app is running!
app.listen(PORT, function() {
  console.log(`Example app listening on port ${PORT}`);
  console.log(users)
});








