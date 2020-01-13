/*
	Gets a faculty record and all associated records and returns as structured JSON
*/
SELECT json_build_object(
	'committee_id', c.committee_id
	,'name', c.name
	,'description', c.description
	,'total_slots', c.total_slots
	,'committee_slots', (
		SELECT json_agg(
			json_build_object(
				'senate_division_short_name', cs.senate_division_short_name
				,'slot_requirements', cs.slot_requirements
			)
		) FROM committee_slots cs WHERE c.committee_id = cs.committee_id
	)
	,'committee_assignment', (
		SELECT json_agg(
			json_build_object(
				'email', ca.email
				,'start_date', ca.start_date
				,'end_date', ca.end_date
				,'full_name', f.full_name
				,'job_title', f.job_title
				,'senate_division_short_name', f.senate_division_short_name
				,'phone_num', f.phone_num
			)
		) From committee_assignment ca 
		INNER JOIN faculty f ON f.email = ca.email
		WHERE c.committee_id = ca.committee_id
	)
) FROM committee c WHERE c.committee_id = $1