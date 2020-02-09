exports.up = function(knex) {
  const dateCheckConstraint =
    'ALTER TABLE committee_assignment ADD CONSTRAINT datecheck CHECK (end_date >= start_date)';

  return knex.schema.raw(dateCheckConstraint);
};

exports.down = function(knex) {
  const dateCheckConstraint =
    'ALTER TABLE committee_assignment DROP CONSTRAINT datecheck';

  return knex.schema.raw(dateCheckConstraint);
};
