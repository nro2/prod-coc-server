create table department(
  department_id serial not null,
  name varchar(256) not null,
  description varchar default null,
  primary key (department_id)
);

create table faculty(
  faculty_id serial not null,
  full_name varchar not null,
  email varchar(256) not null,
  job_title varchar(256) default null,
  department_id int not null,
  primary key(faculty_id),
  foreign key(department_id) references department (department_id)
);

create table survey_data(
  survey_date date not null,
  faculty_id int not null,
  is_interested boolean not null,
  expertise varchar,
  primary key (survey_date, faculty_id),
  foreign key (faculty_id) references faculty (faculty_id)
);

create table committee(
  committee_id serial not null,
  name varchar not null,
  description varchar,
  primary key(committee_id)
);

create table survey_choice(
  choice_id serial not null,
  survey_date date not null,
  faculty_id int not null,
  committee_id int not null,
  choice_priority int,
  primary key (choice_id, faculty_id, survey_date, committee_id),
  foreign key (faculty_id) references faculty (faculty_id),
  foreign key (committee_id) references committee (committee_id)
);

create table committee_assignment(
  faculty_id int not null,
  committee_id int not null,
  start_date date,
  end_date date,
  primary key (faculty_id, committee_id),
  foreign key (faculty_id) references faculty (faculty_id),
  foreign key (committee_id) references committee (committee_id)
);