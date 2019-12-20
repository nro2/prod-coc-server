const department = require('./data/department');
const senateDivision = require('./data/senate-division');
const faculty = require('./data/faculty');
const departmentAssociations = require('./data/department-associations');
const surveyData = require('./data/survey-data');
const committee = require('./data/committee');
const surveyChoice = require('./data/survey-choice');
const committeeAssignment = require('./data/committee-assignment');
const committeeSlots = require('./data/committee-slots');

async function deleteTables(knex) {
  await knex('committee_slots').del();
  await knex('committee_assignment').del();
  await knex('survey_choice').del();
  await knex('committee').del();
  await knex('survey_data').del();
  await knex('department_associations').del();
  await knex('faculty').del();
  await knex('senate_division').del();
  await knex('department').del();
}

async function seedTables(knex) {
  await knex('department').insert(department);
  await knex('senate_division').insert(senateDivision);
  await knex('faculty').insert(faculty);
  await knex('department_associations').insert(departmentAssociations);
  await knex('survey_data').insert(surveyData);
  await knex('committee').insert(committee);
  await knex('survey_choice').insert(surveyChoice);
  await knex('committee_assignment').insert(committeeAssignment);
  await knex('committee_slots').insert(committeeSlots);
}

exports.seed = async knex => {
  await deleteTables(knex);
  await seedTables(knex);
};
