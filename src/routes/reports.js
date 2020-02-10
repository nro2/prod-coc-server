const express = require('express');
const router = express.Router();
const { getSenateDivisionStats } = require('../database');

router.get('/', async (req, res) => {
  return await getSenateDivisionStats()
    .then(data => {
      if (!data) {
        console.info(`No senate division stats found`);
        return res.status(404).send();
      }

      console.info(
        'Successfully retrieved all senate division stats info from database'
      );
      return res.status(200).send(data.json_build_object);
    })
    .catch(err => {
      console.error(`Error retrieving senate division stats info: ${err}`);
      console.log(err.message);
      console.log(err.detail);
      return res
        .status(500)
        .send({ error: 'Unable to complete database transaction' });
    });
});

module.exports = router;
