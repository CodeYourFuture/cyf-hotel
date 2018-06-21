const SERVER_PORT = process.env.PORT || 8080;

const express = require("express");
const exphbs = require("express-handlebars");
const bodyparser = require("body-parser");

const apiRouter = require("./api");

const app = express();
const router = express.Router();
// const formidable = require(express-formidable);

const dbFilename = 'hotelbase.db';
const sqlite = require('sqlite3').verbose();
let db = new sqlite.Database(dbFilename);
db.run("PRAGMA foreign_keys = ON");

// app.use(formidable());
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
          rows
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
        if (err == null) {
          if (row === undefined) {
            res.status(400).send(`A customer with an ID '${req.params.id}' hasn't been created yet`);
          } else {
            res.status(200).json({
              customer: row
            });
          };
        } else {
          res.status(500).json({ error: err });
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

// Get customers where surname like %bla-bla%
app.get("/customers/namelike/:surname", function (req, res) {
  var surname = req.params.surname;
  db.get(`SELECT * FROM customers WHERE surname like '%${req.params.surname}%'`,
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

app.get('/api/customers-data', function (req, res) {
  db.all(`Select customers.id, customers.title, customers.firstname, customers.surname, 
  customers.email, reservations.rooms_id, reservations.checkin_date, reservations.checkout_date from reservations JOIN customers ON reservations.customer_id = customers.id`, [], 
  function (err, rows) {
    if (err) {
      res.status(500).end()
      console.log(err)
    } else {
      res.status(200).json({
        rows
      })
    }
  })
})

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

// Provide an endpoint for making changes to a customer’s data - provide all the column values, even if unchanged
app.put('/customers/:id', function (req, res) {
  var id = req.params.id;
  var ttl = req.body.title;
  var fnm = req.body.firstname;
  var snm = req.body.surname;
  var eml = req.body.email;
  var cit = req.body.city;
  var pos = req.body.postcode;
  var count = req.body.country;
  var tel = req.body.phone;
  if (id == parseInt(id)) {
    db.get("SELECT * FROM customers WHERE id = ?", [id],
      function (err, row) {
        if (err == null) {
          if (row === undefined) {
            res.status(400).send(`A customer with an ID '${req.params.id}' hasn't been created yet`);
          } else {
            if (ttl && fnm && snm && eml && cit && pos && count && tel) {
              db.run("update customers set title = ?, firstname = ?, surname = ?, email = ?, city = ?, postcode = ?, country = ?, phone = ? WHERE id = ?", [ttl, fnm, snm, eml, cit, pos, count, tel, id], function (err, row) {
                if (err == null) {
                  console.log(`DATA USER ID = ${req.params.id} was changed`);
                  res.status(200).send(`Total data changes = ${this.changes}`);
                } else {
                  res.status(500).json({ error: err });
                };
              });
            } else {
              res.status(400).send(`You should provide all data for customer`)
            };
          };
        };
      });
  };
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

// Allow users to delete a paid invoice from the database
app.get("/invoices/paid/:paid", function (req, res) {
  var paid = req.params.paid;
  if (paid == parseInt(paid) && paid == 1) {
    db.run("delete from invoices WHERE paid = ?", [paid],
      function (err, row) {
        if (err == null) {
          res.status(200).send(
            `All paid invoices has been deleted`
          );
        } else {
          res.status(500).json({ error: err });
        }
      });
  } else {
    res.status(400).send(`You should type 1 to delete paid invoices`);
  };
});

// Provide the means to mark an invoice as paid
app.get("/invoices/:id/:paid", function (req, res) {
  var inv_id = req.params.id;
  var paid = req.params.paid;
  if (inv_id == parseInt(inv_id) && paid == parseInt(paid) && paid == 1) {
    db.run("update invoices set paid = ? WHERE id = ?", [paid, inv_id],
      function (err, row) {
        if (err == null) {
          res.status(200).send(
            `Invoice_id = ${inv_id} set as paid = ${paid}`
          );
        } else {
          res.status(500).json({ error: err });
        }
      });
  } else {
    res.status(400).send(`You should type integer number 1 to change type of invoices`);
  };
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


app.post("/reservations/", function (req, res) {
  var cust_id = req.body.customer_id;
  var rom_id = req.body.rooms_id;
  var indate = req.body.checkin_date;
  var outdate = req.body.checkout_date;
  var price = req.body.price_per_night;
  db.get("SELECT * FROM customers WHERE id = ?", [cust_id], function (err, row) {
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

// Make it possible for a customer’s room to be changed if necessary
app.get("/reservations/:customer_id/:rooms_id", function (req, res) {
  var cust_id = req.params.customer_id;
  var rom_id = req.params.rooms_id;
  if (cust_id == parseInt(cust_id) && rom_id == parseInt(rom_id)) {
    db.run("update reservations set rooms_id = ? WHERE customer_id = ?", [rom_id, cust_id],
      function (err, row) {
        if (err == null) {
          res.status(200).send(
            `Room_number = ${rom_id} changed for customer_id = ${cust_id}`
          );
        } else {
          res.status(500).json({ error: err });
        }
      });
  } else {
    res.status(400).send(`You should type integer number to change room number`);
  };
});
// Delete reservations by ID
app.delete("/reservations/:id", function (req, res) {
  var id = req.params.id;
  if (id == parseInt(id)) {
    db.run("delete from reservations WHERE id = ?", [id],
      function (err, row) {
        if (err == null) {
          res.status(200).send(
            `Data from reservations ${id} has been deleted`
          );
        } else {
          res.status(500).json({ error: err });
        }
      });
  } else {
    res.status(400).send(`You should type integer number to delete canceled reservations`);
  };
});

// Get a list of all the reservations that start at a given date
app.get("/reservations-start-date/:startDate", function (req, res) {
  var date = req.params.startDate;
  db.all("select * from reservations where checkin_date >= ?", [date], function (err, rows) {
    if (err == null) {
      res.status(200).json({
        reservations: rows
      });
    } else {
      res.status(500).json({ error: err });
    }
  });
});

// Get a list of all the reservations that is active at a given date
app.get("/reservations-active-date/:activeDate", function (req, res) {
  var date = req.params.activeDate;
  db.all("select * from reservations where ? between checkin_date and checkout_date", [date], function (err, rows) {
    if (err == null) {
      res.status(200).json({
        reservations: rows
      });
    } else {
      res.status(500).json({ error: err });
    }
  });
});


app.listen(SERVER_PORT, () => {
  console.info(`Server started at http://localhost:${SERVER_PORT}`);
});