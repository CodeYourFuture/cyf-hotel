const express = require('express');

const router = express.Router();


router.get('/customers', function(req, res) {
  // TODO: fix code here
  res.status(200).json({
    customers: [{
      id: 2,
      title: 'Mr',
      firstname: 'Laurie',
      surname: 'Ainley',
      email: 'laurie@ainley.com'
    }
  ]});
});


router.get('/customers/:id', function(req, res) {
  // TODO: add for code here
});


router.get('/customers/:surname', function(req, res) {
  // TODO: add for code here
});


router.post('/customers/', function(req, res) {
  // EXPECTED JSON Object:
  // {
  //   title: 'Mr',
  //   firstname: 'Laurie',
  //   surname: 'Ainley',
  //   email: 'laurie@ainley.com'
  // }

  // TODO: add for code here
});


router.put('/customers/:id', function(req, res) {
  // EXPECTED JSON Object:
  // {
  //   title: 'Mr',
  //   firstname: 'Laurie',
  //   surname: 'Ainley',
  //   email: 'laurie@ainley.com'
  // }

  // TODO: add for code here
});


// get '/reservations'
// TODO: add for code here


// get '/reservations/:id'
// TODO: add for code here


// get '/reservations/starting-on/:startDate'
// TODO: add for code here


// get '/reservations/active-on/:date'
// TODO: add for code here


// post '/reservations'
// EXPECTED JSON Object:
// {
//   customer_id: 1,
//   room_id: 1,
//   check_in_date: '2018-01-20',
//   check_out_date: '2018-01-22',
//   room_price: 129.90
// }
// TODO: add for code here


// get `/detailed-invoices'
// TODO: add for code here


// get `/reservations/details-between/:from_day/:to_day`
// TODO: add for code here

module.exports = router;
