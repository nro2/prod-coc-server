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

  db.one('SELECT * FROM users WHERE first_name= $1', ['Josh'])
      .then((data)=> {
        return res.status(200).send(data.last_name)
      })
      .catch((err)=>{
        console.log(err);
        return res.status(404).send("BAD REQUEST")
      })
});

router.post('/', (req, res) => {

  db.none('INSERT INTO users(first_name, last_name) values($1, $2, $3)', [req.firstName, req.lastName, req.phoneNum])
      .then(()=>{
        return res.status(200).send('Data insert was a success was a success')
      })
      .catch((err)=>{
        console.log(err);
        return res.status(404).send("BAD REQUEST")
      })
});

module.exports = router;
