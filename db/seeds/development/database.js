exports.seed = knex => {
  return knex('department')
    .del()
    .then(() =>
      knex('department').insert({
        name: 'Computer Science Department',
        description: 'In charge of all the CS',
      })
    )
    .then(() =>
      knex('department').insert({
        name: 'Social Science Department',
        description: 'In charge of social sciences',
      })
    )
    .then(() =>
      knex('department').insert({
        name: 'Math Department',
        description: 'In charge of adding numbers',
      })
    )
    .then(() =>
      knex('department').insert({
        name: 'Physics Department',
        description: 'Does physics',
      })
    )
    .then(() =>
      knex('department').insert({
        name: 'Music Department',
        description: 'Makes sounds and stuff',
      })
    );
};
