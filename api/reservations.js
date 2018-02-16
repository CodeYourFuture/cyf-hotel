const express = require("express");
const router = express.Router();

const reservations = require("../public/data/reservations.json");

router.post("/reservations", (req, res) => {
  // TODO read req.body.reservation, look up price by room id and insert reservation into DB
  res.status(200).json(req.body.reservation);
});

router.get("/:id?", (req, res) => {
  if (req.params.id) {
    res.status(200).json({
      reservations: reservations.filter(reservation => reservation.id === parseInt(req.params.id))
  });
  } else {
    res.status(200).json({
      reservations
    });
  }
});

router.get("/reservations/date-from/:dateFrom", (req, res) => {
  // TODO read req.params.dateFrom to look up reservations and return
  res.status(200).json({
    reservations: [
      {
        title: "Mr",
        firstname: "Laurie",
        surname: "Ainley",
        email: "laurie@ainley.com",
        roomId: 1,
        checkInDate: "2017-10-10",
        checkOutDate: "2017-10-17"
      },
      {
        title: "Miss",
        firstname: "Someone",
        surname: "Else",
        email: "someone@else.com",
        roomId: 2,
        checkInDate: "2017-11-12",
        checkOutDate: "2017-11-15"
      }
    ]
  });
});
// window.addEventListener('load', yourFunction, false);
// var index,table = window.document.getElementsByClass("table")
// for(var i = 1;i<table.rows.length; i++){
//   table.rows[i].cells[5].onclick = function(){
//     var c = confirm("Do you want to delete?")
//     if(c===true){
//       index= this.parentElement.rowIndex;
//       table.deleteRow(index);
//     }
//   }
// }

module.exports = router;
