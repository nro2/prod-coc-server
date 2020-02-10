exports.up = function(knex) {
  const totalAndFilledSlots = `CREATE OR REPLACE VIEW total_and_filled_slots AS
SELECT 
(SELECT sum(total_slots) FROM committee) AS total_slots
,(SELECT count(email) FROM committee_assignment) AS slots_filled`;

  const senateDivisionStats = `CREATE OR REPLACE VIEW senate_division_stats AS
SELECT senate_division
, sum(coalesce(sd_slot_minimum,0)) AS SlotMinimum
, SUM(COALESCE(sd_slot_filled,0)) AS SlotsFilled
, SUM(COALESCE(sd_slots_remaining,0)) AS SlotsRemaining 
FROM slot_stats
GROUP BY senate_division`;

  return knex.schema.raw(totalAndFilledSlots).raw(senateDivisionStats);
};

exports.down = function(knex) {
  const totalAndFilledSlots = `DROP VIEW IF EXISTS total_and_filled_slots`;
  const senateDivisionStats = `DROP VIEW IF EXISTS senate_division_stats`;

  return knex.schema.raw(totalAndFilledSlots).raw(senateDivisionStats);
};
