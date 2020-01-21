exports.up = function(knex) {
  let rawSlotsFilled = `
  CREATE OR REPLACE VIEW slotsfilled AS
  SELECT
  SlotsFilled.senate_division_short_name
  ,SlotsFilled.committee_id
  ,SlotsFilled.slotsfilled
  ,COALESCE(SlotReqs.slot_requirements,0) AS slot_requirements
  FROM
  (
      SELECT 
      faculty.senate_division_short_name
      ,ca.committee_id
      ,count(ca.committee_id) AS SlotsFilled
      FROM committee_assignment as ca
      NATURAL JOIN Faculty
      GROUP BY
      faculty.senate_division_short_name
      ,ca.committee_id
  ) AS SlotsFilled
  LEFT OUTER JOIN (
  select * from committee_slots
  ) AS SlotReqs ON SlotReqs.committee_id = SlotsFilled.committee_id 
  AND SlotReqs.senate_division_short_name = SlotsFilled.senate_division_short_name`;

  let rawSlotsFilledTrigger = `
  CREATE OR REPLACE FUNCTION public.slots_filled() RETURNS trigger 
  LANGUAGE plpgsql AS
  $$BEGIN
     IF EXISTS ( 
	     SELECT * FROM inserted
	     INNER JOIN faculty ON faculty.email = inserted.email
	     INNER JOIN slotsfilled ON slotsfilled.committee_id = inserted.committee_id 
	     AND slotsfilled.senate_division_short_name = faculty.senate_division_short_name
         AND slotsfilled.slotsfilled + 1 > slotsfilled.slot_requirements
        )
     THEN
        RAISE EXCEPTION 'The slots for this senate division are full.';
     END IF;
	  RETURN NULL;
  END;$$;

  DROP TRIGGER IF EXISTS slot_requirement ON public.committee_assignment;
 
  CREATE TRIGGER slot_requirement AFTER INSERT ON public.committee_assignment
	  REFERENCING NEW TABLE AS inserted
     FOR EACH STATEMENT EXECUTE PROCEDURE public.slots_filled();`;

  return knex.schema.raw(rawSlotsFilled).raw(rawSlotsFilledTrigger);
};

exports.down = function(knex) {
  let rawSlotsFilled = `DROP VIEW IF EXISTS SlotsFilled`;
  let rawSlotsFilledTrigger = `DROP TRIGGER IF EXISTS slot_requirement ON public.committee_assignment;`;

  return knex.schema.raw(rawSlotsFilled).raw(rawSlotsFilledTrigger);
};
