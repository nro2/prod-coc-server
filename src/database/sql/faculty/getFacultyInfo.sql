/*
	Gets a faculty record and all associated records and returns as structured JSON
*/
SELECT json_build_object(
	'full_name', f.full_name
	,'email', f.email
	,'phone_num', f.phone_num
	,'job_title', f.job_title
	,'senate_division_short_name', f.senate_division_short_name
	,'departments', (
		SELECT json_agg(
			json_build_object(
				'department_id', da.department_id
				,'name', d.name
				,'description', d.description
			)
		    ORDER BY d.name ASC
		) FROM department_associations da NATURAL JOIN Department d
		WHERE f.email = da.email
	)
	,'committees', (
		SELECT json_agg(
			json_build_object(
				'committee_id', ca.committee_id
				,'start_date', ca.start_date
				,'end_date', ca.end_date
				,'name', c.name
				,'description', c.description
				,'total_slots', c.total_slots
			)
		    ORDER BY c.name ASC
		) FROM committee_assignment ca NATURAL JOIN committee c
		WHERE f.email = ca.email
	)
	,'surveys', (
		SELECT json_build_object(
				'survey_date', mrs.survey_date
				,'is_interested', mrs.is_interested
				,'expertise', mrs.expertise
				,'choices', (
					SELECT json_agg(
						json_build_object(
							'choice_id', sc.choice_id
							,'committee_id', sc.committee_id
							,'name', scc.name
							,'description', scc.description
							,'total_slots', scc.total_slots
						)
					) FROM survey_choice sc NATURAL JOIN committee scc WHERE mrs.survey_date = sc.survey_date AND sc.email = mrs.email
				)
		) FROM most_recent_survey mrs
		WHERE f.email = mrs.email
	)
) FROM faculty f WHERE f.email = $1