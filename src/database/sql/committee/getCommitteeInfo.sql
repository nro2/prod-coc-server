/*
  Gets a committee record and all associated records and returns as structured JSON
*/

SELECT json_build_object(
  'name', c.name
  ,'Id', c.committee_id
  ,'description', c.description
  ,'totalSlots',c.total_slots
  ,'committeeSlots',(
		SELECT json_agg(
			json_build_object(
				/*'senateDivision', senate_division*/
				'senateShortname', cs.senate_division_short_name
				,'slotFilled', sd_slot_filled
				,'slotMinimum'
				,CASE
				WHEN ss.sd_slot_minimum IS NULL THEN 0
				ELSE ss.sd_slot_minimum
				END
				,'slotsRemaining'
				,CASE
				WHEN ss.sd_slot_minimum IS NULL THEN 0
				ELSE ss.sd_slot_minimum - sd_slot_filled
				END
			)
		)FROM  committee_slots cs LEFT OUTER JOIN slot_stats ss
		on cs.committee_id  = ss.committee_id AND cs.senate_division_short_name
		= ss.senate_division
		WHERE c.committee_id = cs.committee_id
	)
  ,'committeeAssignment',(
		SELECT json_agg(
			json_build_object(
				'facultyName', f.full_name
				,'facultyEmail', f.email
				,'startDate', ca.start_date
				,'endDate', ca.end_date
				,'senateDivsion', f.senate_division_short_name
			)
		) FROM committee_assignment ca NATURAL JOIN faculty f
		WHERE f.email = ca.email AND ca.committee_id = c.committee_id
	)

)FROM committee c WHERE c.committee_id = $1