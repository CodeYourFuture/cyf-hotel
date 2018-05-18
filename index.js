const SERVER_PORT = process.env.PORT || 8080;

const express = require("express");
const exphbs = require("express-handlebars");
const bodyparser = require("body-parser");

const apiRouter = require("./api");

const app = express();
const router = express.Router();

const dbFilename = 'hotelbase.db';
const sqlite = require('sqlite3').verbose();
let db = new sqlite.Database(dbFilename);
db.run("PRAGMA foreign_keys = ON");


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



app.get("/customers", function (req, res) {
  db.all("SELECT title, firstname, surname, email " +
    "FROM customers", function (err, rows) {
      if (err == null) {
        rows.forEach(function (row) {
          console.log(row.title, row.firstname,
            row.surname, row.email);
        });
        res.status(200).json({
          customers: rows
        });
      } else {
        res.status(500).json({ error: err });
      }
    });
});

app.get("/customers/:id", function (req, res) {
  var id = req.params.id;
  if (id == parseInt(id)) {
    db.get("SELECT * FROM customers WHERE id = ?", [id],
      function (err, row) {
        if (row === undefined) {
          res.status(400).send(`A customer with an ID '${req.params.id}' hasn't been created yet`);
        } else {
          res.status(200).json({
            customer: row
          })
        };
      });
  } else {
    res.status(400).send(`Entered data by ID customer '${req.params.id}' is not an integer number`);
  };
});

app.get("/customers/name/:surname", function (req, res) {
  var surname = req.params.surname;
  db.get("SELECT * FROM customers WHERE surname = ?", [surname],
    function (err, row) {
      if (err == null) {
        res.status(200).json({
          customer: row
        });
      } else {
        res.status(500).json({ error: err });
      }
    });
});

app.post("/customers/", function (req, res) {
  var ttl = req.body.title;
  var fnm = req.body.firstname;
  var snm = req.body.surname;
  var eml = req.body.email;
  db.run("INSERT INTO customers (title, firstname, surname, email) VALUES (?, ?, ?, ?)",
    [ttl, fnm, snm, eml], function (err) {
      if (err == null) {
        var rowid = this.lastID;  //get the PK
        console.log(`New customer id = ${rowid}`);
        res.status(200).json({ lastId: rowid.toString() });  // return the PK
      } else {
        res.status(500).json({ error: err });
      }
    });
});

app.get("/invoices", function (req, res) {
  db.all("SELECT id, total, invoice_date, paid  " +
    "FROM invoices", function (err, rows) {
      if (err == null) {
        rows.forEach(function (row) {
          console.log(row.id, row.total,
            row.invoice_date, row.paid);
        });
        res.status(200).json({
          invoices: rows
        });
      } else {
        res.status(500).json({ error: err });
      }
    });
});

app.get("/invoices/:id", function (req, res) {
  var id = req.params.id;
  db.get("SELECT * FROM invoices WHERE id = ?", [id],
    function (err, row) {
      if (err == null) {
        res.status(200).json({
          invoice: row
        });
      } else {
        res.status(500).json({ error: err });
      }
    });
});


app.get("/reservations", function (req, res) {
  db.all("SELECT * FROM reservations", function (err, rows) {
    if (err == null) {
      rows.forEach(function (row) {
        console.log(row.id, row.checkin_date,
          row.checkout_date, row.price_per_night);
      });
      res.status(200).json({
        reservations: rows
      });
    } else {
      res.status(500).json({ error: err });
    }
  });
});

app.get("/reservations/:id", function (req, res) {
  var id = req.params.id;
  db.get("SELECT * FROM reservations WHERE id = ?", [id],
    function (err, row) {
      if (err == null) {
        res.status(200).json({
          reservation: row
        });
      } else {
        res.status(500).json({ error: err });
      }
    });
});


app.post('/reservations/', function (req, res) {
  var cust_id = req.body.customer_id;
  var rom_id = req.body.rooms_id;
  var indate = req.body.checkin_date;
  var outdate = req.body.checkout_date;
  var price = req.body.price_per_night;
  db.get("SELECT * FROM customers WHERE id = ?", [cust_id], function (err, row) {
    console.log(row, typeof row);
    if (row === undefined) {
      res.status(400).send(`A customer with an ID '${req.body.customer_id}' hasn't been created yet`);
    } else {
      db.run("INSERT INTO reservations (customer_id, rooms_id, checkin_date, checkout_date, price_per_night) VALUES (?, ?, ?, ?, ?)",
        [cust_id, rom_id, indate, outdate, price], function (err) {
          if (err == null) {
            var rowid = this.lastID;  //get the PK
            console.log(`New reservation id = ${rowid}`);
            res.status(200).json({ last_reservation: rowid.toString() });  // return the PK
          } else {
            res.status(500).json({ error: err });
          };
        });
    };
  });
});

app.listen(SERVER_PORT, () => {
  console.info(`Server started at http://localhost:${SERVER_PORT}`);
});