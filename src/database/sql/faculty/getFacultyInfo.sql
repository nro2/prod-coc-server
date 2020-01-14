/*
	Gets a faculty record and all associated records and returns as structured JSON
*/
SELECT json_build_object(
	'faculty_id', f.faculty_id
	,'full_name', f.full_name
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
		) FROM department_associations da NATURAL JOIN Department d
		WHERE f.email = da.email
	)
) FROM faculty f WHERE f.email = $1