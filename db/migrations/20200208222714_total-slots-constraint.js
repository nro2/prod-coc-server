exports.up = function(knex) {
  const totalSlots = `CREATE OR REPLACE FUNCTION check_total_slots_constraints() RETURNS trigger AS 
$$
DECLARE
  total_requirements int;
  total_slots int;
  
BEGIN 
	SELECT SUM(slot_requirements) AS sumOfRequirements FROM committee_slots WHERE committee_id = NEW.committee_id GROUP BY committee_id into total_requirements;
	total_slots = NEW.total_slots;
	IF total_slots < total_requirements THEN 
		RAISE EXCEPTION 'There are more requirements than total slots.'
		USING DETAIL = 'total_requirements: ' || total_requirements || ', total_slots: ' || total_slots,
      	HINT = 'Delete or lower some requirements first.',
		ERRCODE = 'CSV03';
	ELSE
		RETURN NEW;
	END IF;

END 
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_total_slots
BEFORE UPDATE ON committee
    FOR EACH ROW EXECUTE FUNCTION check_total_slots_constraints();`;

  return knex.schema.raw(totalSlots);
};

exports.down = function(knex) {
  const totalSlots = `DROP FUNCTION IF EXISTS check_total_slots_constraints CASCADE;`;
  return knex.schema.raw(totalSlots);
};
