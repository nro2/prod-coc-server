exports.up = function(knex) {
  let mostRecentSurvey = `
CREATE OR REPLACE view most_recent_survey AS
SELECT
survey_data.survey_date
,survey_data.email
,survey_data.is_interested
,survey_data.expertise

FROM survey_data 
INNER JOIN (
	SELECT max(survey_date) AS RecentDate
	,email 
	FROM survey_data 
	GROUP BY email
) AS MostRecentSurvey
ON survey_data.survey_date = MostRecentSurvey.RecentDate 
AND survey_data.email = MostRecentSurvey.email`;

  return knex.schema.raw(mostRecentSurvey);
};

exports.down = function(knex) {
  let mostRecentSurvey = `DROP VIEW IF EXISTS most_recent_survey`;

  return knex.schema.raw(mostRecentSurvey);
};
