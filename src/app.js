var express = require("express");
var app = express();
var mongoose = require("mongoose");
var passport = require("passport");
var localStrategy = require("passport-local");
var bodyParser = require("body-parser");

var Web3 = require("web3");
var jsdom = require("jsdom");
var $ = require("jquery")(new jsdom.JSDOM().window);
var Window = require("window");
var window = new Window();

const tenderJSON = require("../build/contracts/TenderAuction.json");
const truffleContract = require("truffle-contract");

var User = require("./models/user");

//CREATING EXPRESS-SESSION
app.use(
  require("express-session")({
    secret: "Hi there",
    resave: false,
    saveUninitialized: false,
  })
);

//SETTING UP PASSPORT
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static("public"));
app.set("view engine", "ejs");

app.use(function (req, res, next) {
  res.locals.currentUser = req.user;
  next();
});

var mongoURI =
  "mongodb+srv://shwetkhatri2001:2vToBrP1GrpGjEPa@trackcluster.clkcfr3.mongodb.net/TrackMine?retryWrites=true&w=majority";
// var mongoURI = process.env.MONGOURI;

//CONNECTING WITH DATABASE
var connection = mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.get("/tenderJSON", (req, res) => {
  res.send(tenderJSON);
});

app.get("/truffleContract", (req, res) => {
  res.send(truffleContract);
});

app.get("/", (req, res) => {
  if (req.user) {
    if (req.user.type !== "false") {
      res.redirect("/dashboard");
    } else {
      res.redirect("/confirmType");
    }
  } else {
    res.redirect("/authenticate");
  }
});

app.get("/authenticate", (req, res) => {
  if (req.user) {
    res.redirect("/");
  } else {
    res.render("auth.ejs");
  }
});

app.get("/confirmType", (req, res) => {
  if (req.user) {
    if (req.user.type !== "false") {
      res.redirect("/");
    } else {
      res.render("confirmType.ejs");
    }
  } else {
    res.redirect("/");
  }
});

app.get("/dashboard", (req, res) => {
  if (req.user) {
    if (req.user.type !== "false") {
      res.render("commonDashboard.ejs");
    } else {
      res.redirect("/confirmType");
    }
  } else {
    res.redirect("/");
  }
});

app.get("/createActor", (req, res) => {
  User.findOne({ username: req.query.username }, (err, user) => {
    if (user.type === "false") {
      user.type = req.query.type;
      user.save();
    }
  });
  res.redirect("/");
});

//AUTHENTICATION
app.post("/signup", function (req, res) {
  var name = req.body.name;
  var username = req.body.username;
  var password = req.body.password;

  var newUser = new User({ username: username, name: name, type: "false" });
  User.register(newUser, password, function (err, user) {
    if (err) {
      console.log(err);
      return res.redirect("/");
    }
    passport.authenticate("local")(req, res, function () {
      res.redirect("/");
    });
  });
});

//USER LOG IN
app.post(
  "/signin",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/",
  }),
  function (req, res) {}
);

//USER LOG OUT
app.get("/logout", function (req, res) {
  req.logout();
  res.redirect("/");
});

app.listen(3000, () => {
  console.log("Server started at 3000");
});
