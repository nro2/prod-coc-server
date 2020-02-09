SELECT json_build_object(
	'total_slots', tfs.total_slots
	,'slots_filled', tfs.slots_filled
	,'senate_division', (
		SELECT json_agg(
			json_build_object(
				'senate_division', sds.senate_division
				,'SlotMinimum', sds.SlotMinimum
				,'SlotsFilled', sds.SlotsFilled
				,'SlotsRemaining', sds.SlotsRemaining
			)
		) FROM senate_division_stats sds
	)
) FROM total_and_filled_slots tfs