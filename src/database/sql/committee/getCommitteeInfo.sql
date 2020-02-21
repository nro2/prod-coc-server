/*
  Gets a committee record and all associated records and returns as structured JSON
*/

SELECT json_build_object(
  'name', c.name
  ,'id', c.committee_id
  ,'description', c.description
  ,'totalSlots',c.total_slots
  ,'slotsRemaining',c.total_slots - COALESCE(sumSlotsFilled.slotsTaken,0)
  ,'committeeSlots', (
		SELECT json_agg(
	  		json_build_object(
				'senateShortname',CASE 
					WHEN senate_division IS NULL THEN '-'
					ELSE senate_division
					END
				,'slotFilled',sd_slot_filled
				,'slotMinimum',COALESCE(sd_slot_minimum,0)
				,'slotsRemaining',CASE 
					WHEN sd_slots_remaining < 0 THEN 0
					ELSE sd_slots_remaining
					END	
			)
	        ORDER BY senate_division ASC
		)FROM slot_Stats ss
	  WHERE c.committee_id = ss.committee_id
  )
  ,'committeeAssignment',(
		SELECT json_agg(
			json_build_object(
				'facultyName', f.full_name
				,'facultyEmail', f.email
				,'startDate', ca.start_date
				,'endDate', ca.end_date
				,'senateDivision', f.senate_division_short_name
			)
	        ORDER BY f.full_name ASC
		) FROM committee_assignment ca NATURAL JOIN faculty f
		WHERE f.email = ca.email AND ca.committee_id = c.committee_id
	)

)FROM committee c
LEFT OUTER JOIN (
	SELECT committee_id, COUNT(email) AS slotsTaken FROM committee_assignment GROUP BY committee_id
) AS sumSlotsFilled ON sumSlotsFilled.committee_id = c.committee_id

WHERE c.committee_id = $1