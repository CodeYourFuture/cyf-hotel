const SERVER_PORT = process.env.PORT || 8080;

const express = require("express");
const exphbs = require("express-handlebars");
const bodyparser = require("body-parser");

const apiRouter = require("./api");

const app = express();
const router = express.Router();

const dbFilename = 'mydatabase.sqlite';
const sqlite = require('sqlite3').verbose();
let db = new sqlite.Database(dbFilename);


app.engine(
  "hbs",
  exphbs({
    defaultLayout: "main",
    extname: "hbs"
  })
);
app.set("view engine", "hbs");

app.use(express.static("public"));
app.use(express.static("assets"));

app.use("/api", apiRouter);

// handle HTTP POST requests
app.use(bodyparser.json());

app.get("/", function (req, res, next) {
  res.render("home");
});

app.listen(SERVER_PORT, () => {
  console.info(`Server started at http://localhost:${SERVER_PORT}`);
});

app.get("/customers", function (req, res) {
  db.all("SELECT title, firstname, surname, address " +
    "FROM customers", function (err, rows) {
      rows.forEach(function (row) {
        console.log(row.title, row.firstname,
          row.surname);
      });
      res.status(200).json({
        customers: rows
      });
    });
});

app.get("/customers/:id", function (req, res) {
  var id = req.params.id;
  db.get("SELECT * FROM customers WHERE id = ?", [id],
    function (err, row) {
      res.status(200).json({
        customer: row
      });
    });
});

app.get("/customers/name/:surname", function (req, res) {
  var surname = req.params.surname;
  db.get("SELECT * FROM customers WHERE surname = ?", [surname],
    function (err, row) {
      res.status(200).json({
        customer: row
      });
    });
});

app.post("/customers/", function (req, res) {
  var ttl = req.body.title;
  var fnm = req.body.firstname;
  var snm = req.body.surname;
  var adr = req.body.address;
  db.run("INSERT INTO customers (title, firstname, surname, address) VALUES (?, ?, ?, ?)",
      [ttl, fnm, snm, adr], function(err) {
      if (err == null) {
        var rowid = this.lastID;  //get the PK
        // console.log(typeof rowid);
        console.log(`New customer id = ${rowid}`);
        res.status(200).json({lastId: rowid.toString()});  // return the PK
      } else {
        res.status(500).json({error: err});
      }
  });
});