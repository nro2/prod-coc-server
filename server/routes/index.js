const express = require('express');
const router = express.Router();
const pgp = require('pg-promise')();

const config = {
  host: "localhost",
  port: 54320,
  database: 'coc',
  user: 'coc',
  password: 'pwd123'
};
const db = pgp(config);

router.get('/', (req, res) => {

  db.one('SELECT * FROM users WHERE first_name= $1', [req.query.firstName])
      .then((data)=> {
          let user = {
              firstName: data.first_name,
              lastName: data.last_name,
              phoneNum: data.phone_number
          }
        return res.status(200).send(user)
      })
      .catch((err)=>{
        console.log(err.message);
        return res.status(404).send(err.message)
      })
});

router.get('/committees', (req, res) =>{

    db.any('SELECT * FROM all_committees')
        .then((data)=>{
            return res.status(200).send(data)
        })
        .catch((err)=>{
            console.log(err.message);
            return res.status(404).send(err.message)
        })
})

router.post('/', (req, res) => {


  db.none('INSERT INTO users(first_name, last_name, phone_number) values($1, $2, $3)', [req.body.firstName, req.body.lastName, req.body.phoneNum])
      .then(()=>{
        return res.status(200).send('Data insert was a success')
      })
      .catch((err)=>{
        console.log(err);
        return res.status(404).send("BAD REQUEST")
      })
});

module.exports = router;
