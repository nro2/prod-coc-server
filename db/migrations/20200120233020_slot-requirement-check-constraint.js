exports.up = function(knex) {
  let slotStats = `
CREATE OR REPLACE view slot_stats AS
SELECT
comm_sen_combo_list.committee_id
,comm_sen_combo_list.senate_division
,comm_sen_combo_list.sd_slot_minimum
,COALESCE(committee_senate_faculty_count.slots_filled,0) AS sd_slot_filled
,comm_sen_combo_list.sd_slot_minimum - COALESCE(committee_senate_faculty_count.slots_filled,0) AS sd_slots_remaining
,comm_sen_combo_list.c_total_slots 
,sum(COALESCE(committee_senate_faculty_count.slots_filled,0)) 
OVER (PARTITION BY comm_sen_combo_list.committee_id) AS c_total_slots_filled
,comm_sen_combo_list.c_total_slots - sum(COALESCE(committee_senate_faculty_count.slots_filled,0)) 
OVER (PARTITION BY comm_sen_combo_list.committee_id) AS c_slots_left

FROM (
	SELECT
	c.committee_id
	,cs.senate_division_short_name AS senate_division
	,cs.slot_requirements AS sd_slot_minimum
	,c.total_slots AS c_total_slots
	FROM committee AS c
	LEFT OUTER JOIN committee_slots as cs ON cs.committee_id = c.committee_id

	UNION ALL

	SELECT
	c.committee_id
	,f.senate_division_short_name
	,null
	,c.total_slots

	from committee as c
	INNER JOIN committee_assignment as ca ON c.committee_id = ca.committee_id
	INNER JOIN faculty as f on f.email = ca.email
	LEFT OUTER JOIN committee_slots as cs on cs.committee_id = ca.committee_id and cs.senate_division_short_name = f.senate_division_short_name
	WHERE cs.committee_id is null
) AS comm_sen_combo_list
LEFT OUTER JOIN (
	SELECT
	ca.committee_id
	,f.senate_division_short_name as senate_division
	,count(ca.committee_id) as slots_filled
	From committee_assignment as ca
	INNER JOIN faculty as f ON f.email = ca.email
	GROUP BY ca.committee_id,f.senate_division_short_name
) AS committee_senate_faculty_count 
ON committee_senate_faculty_count.committee_id = comm_sen_combo_list.committee_id 
AND committee_senate_faculty_count.senate_division = comm_sen_combo_list.senate_division

order by committee_id`;

  let checkCommitteeSlotsTrigger = `
CREATE OR REPLACE FUNCTION check_committee_assignment_constraints() RETURNS trigger AS 
$$
DECLARE
  committee_slots_left int;
  current_faculty_senate_slots_remaining int;
  senate_slots_remaining int;
  current_faculty_senate_division nchar(2);
  
BEGIN 
	SELECT senate_division_short_name FROM faculty where email = NEW.email into current_faculty_senate_division;
	SELECT c_slots_left from slot_stats where committee_id = NEW.committee_id GROUP BY c_slots_left into committee_slots_left;
	SELECT slot_stats.sd_slots_remaining from slot_stats where slot_stats.committee_id = NEW.committee_id AND slot_stats.senate_division = current_faculty_senate_division into current_faculty_senate_slots_remaining;
	SELECT sum(slot_stats.sd_slots_remaining) from slot_stats where slot_stats.committee_id = NEW.committee_id AND slot_stats.senate_division NOT IN (current_faculty_senate_division) into senate_slots_remaining;

	IF committee_slots_left >= 0 THEN 
		IF current_faculty_senate_slots_remaining >= 0 THEN 
			RETURN NEW;
		ELSE
			IF senate_slots_remaining <= 0 THEN
				RETURN NEW;
			ELSE
				IF senate_slots_remaining <= committee_slots_left THEN
					RETURN NEW;
				ELSE
					RAISE EXCEPTION 'Adding this faculty violates committee slot requirements.'
      				USING HINT = 'There are slots open, but unmet senate requirements';
				END IF;
			END IF;
		END IF;
	ELSE
		RAISE EXCEPTION 'Adding this faculty violates committee slot requirements.'
      	USING HINT = 'There are not any slots remaining';
	END IF;

END 
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_committee_assignment
AFTER INSERT ON committee_assignment
    FOR EACH ROW EXECUTE FUNCTION check_committee_assignment_constraints();`;

  return knex.schema.raw(slotStats).raw(checkCommitteeSlotsTrigger);
};

exports.down = function(knex) {
  let slotStats = `DROP VIEW IF EXISTS slot_stats`;
  let checkCommitteeSlotsTrigger = `DROP FUNCTION IF EXISTS check_committee_assignment_constraints CASCADE;`;

  return knex.schema.raw(slotStats).raw(checkCommitteeSlotsTrigger);
};
