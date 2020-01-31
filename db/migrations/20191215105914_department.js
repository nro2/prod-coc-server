exports.up = knex => {
  return knex.schema
    .createTable('department', table => {
      table.increments('department_id').primary();
      table.string('name').notNullable();
      table.string('description').notNullable();
    })
    .createTable('senate_division', table => {
      table.string('senate_division_short_name').primary();
      table.string('name').notNullable();
    })
    .createTable('faculty', table => {
      table.string('full_name').notNullable();
      table.string('email').primary();
      table.string('phone_num');
      table.string('job_title').defaultTo(null);
      table.string('senate_division_short_name').notNullable();
      table
        .foreign('senate_division_short_name')
        .references('senate_division.senate_division_short_name');
    })
    .createTable('survey_data', table => {
      table.date('survey_date').notNullable();
      table.string('email');
      table.boolean('is_interested').notNullable();
      table.string('expertise');
      table.primary(['survey_date', 'email']);
      table.foreign('email').references('faculty.email');
    })
    .createTable('committee', table => {
      table.increments('committee_id').primary();
      table.string('name').notNullable();
      table.string('description');
      table.integer('total_slots');
    })
    .createTable('survey_choice', table => {
      table.integer('choice_id').notNullable();
      table.date('survey_date').notNullable();
      table.string('email').notNullable();
      table.integer('committee_id').notNullable();
      table.primary(['choice_id', 'email', 'survey_date', 'committee_id']);
      table.foreign('email').references('faculty.email');
      table.foreign('committee_id').references('committee.committee_id');
    })
    .createTable('committee_assignment', table => {
      table.string('email').notNullable();
      table.integer('committee_id').notNullable();
      table.date('start_date');
      table.date('end_date');
      table.primary(['email', 'committee_id']);
      table.foreign('email').references('faculty.email');
      table.foreign('committee_id').references('committee.committee_id');
    })
    .createTable('department_associations', table => {
      table.string('email').notNullable();
      table.integer('department_id').notNullable();
      table.primary(['email', 'department_id']);
      table.foreign('email').references('faculty.email');
      table.foreign('department_id').references('department.department_id');
    })
    .createTable('committee_slots', table => {
      table.integer('committee_id').notNullable();
      table.string('senate_division_short_name').notNullable();
      table.integer('slot_requirements');
      table.primary(['committee_id', 'senate_division_short_name']);
      table.foreign('committee_id').references('committee.committee_id');
      table
        .foreign('senate_division_short_name')
        .references('senate_division.senate_division_short_name');
    });
};

exports.down = knex => {
  return knex.schema
    .dropTable('committee_slots')
    .dropTable('department_associations')
    .dropTable('committee_assignment')
    .dropTable('survey_choice')
    .dropTable('committee')
    .dropTable('survey_data')
    .dropTable('faculty')
    .dropTable('senate_division')
    .dropTable('department');
};
