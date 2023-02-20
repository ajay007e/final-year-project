var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

var fileUpload = require("express-fileupload");
var session = require("express-session");
//----------------------
var flash = require("express-flash");
var hbs = require("express-handlebars");
//----------------------

var db = require("./config/connection");
var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");

var app = express();
var sessionStore = new session.MemoryStore();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");

app.engine(
  "hbs",
  hbs({
    extname: "hbs",
    defaultLayout: "layout",
    layoutsDir: __dirname + "/views/layout/",
    partialsDir: __dirname + "/views/partials/",
  })
);
//----------------------

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use(
  session({
    secret: "key",
    store: sessionStore,
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 86400 },
  })
);
app.use((req, res, next) => {
  res.locals.flash = req.session.flash;
  delete req.session.flash;
  next();
});
app.use(fileUpload());
db.connect((err) => {
  if (err) console.log("Connection Error");
  // console.log("Database Connected");
});
//------------------

app.use("/", indexRouter);
app.use("/__admin", usersRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
