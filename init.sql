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
  senate_division varchar(256) not null,
  primary key(email)
);

create table survey_data(
  survey_date date not null,
  email varchar(256),
  is_interested boolean not null,
  expertise varchar,
  primary key (survey_date, email),
  foreign key (email) references faculty (email)
);

create table committee(
  committee_id serial not null,
  name varchar not null,
  description varchar,
  primary key(committee_id)
);

create table survey_choice(
  choice_id int not null,
  survey_date date not null,
  email varchar(256) not null,
  committee_id int not null,
  primary key (choice_id, email, survey_date, committee_id),
  foreign key (email) references faculty (email),
  foreign key (committee_id) references committee (committee_id)
);

create table committee_assignment(
  email varchar(256) not null,
  committee_id int not null,
  start_date date,
  end_date date,
  primary key (email, committee_id),
  foreign key (email) references faculty (email),
  foreign key (committee_id) references committee (committee_id)
);

create table department_associations(
  email varchar not null,
  department_id int not null,
  primary key(email, department_id),
  foreign key (email) references faculty (email),
  foreign key (department_id) references department (department_id)
);


insert into department(name, description) values
    ('Computer Science Department', 'In charge of all the CS'),
    ('Social Science Department', 'In charge of social sciences'),
    ('Math Department', 'In charge of adding numbers'),
    ('Physics Department', 'Does physics'),
    ('Music Department', 'Makes sounds and stuff')
;

insert into faculty(full_name, email, job_title, senate_division) values
    ('Josh Wolsborn', 'wolsborn@pdx.edu', 'Professor', 'AO'),
    ('Steve Stevens', 'stevens@pdx.edu', 'Adjunct', 'AO'),
    ('Grace Hopper', 'ghopper@gmail.com', 'Badass', 'BP'),
    ('Issac Newton', 'newtons@gmail.com', 'Professor', 'CQ'),
    ('Name Namerson', 'name@pdx.edu', 'AJob', 'BP'),
    ('Boaty McBoatface', 'boat@gmail.com', 'ABoat', 'AO'),
    ('Betty Brandon', 'betty@oregon.gov', 'Professor', 'BP')

;

insert into department_associations(email, department_id) values
    ('wolsborn@pdx.edu', 1),
    ('ghopper@gmail.com', 1),
    ('stevens@pdx.edu', 2),
    ('newtons@gmail.com', 2),
    ('name@pdx.edu', 3),
    ('boat@gmail.com', 4),
    ('betty@oregon.gov', 5)
;

insert into survey_data(survey_date, email, is_interested, expertise) values
    ('2019-01-01', 'wolsborn@pdx.edu', true, 'CS Student'),
    ('2019-01-01', 'ghopper@gmail.com', true, 'Godmother of computing'),
    ('2019-01-01', 'newtons@gmail.com', true, 'I invented calculus'),
    ('2019-01-01', 'name@pdx.edu', true, 'I program in nothing but ASM'),
    ('2019-01-01', 'boat@gmail.com', true, 'Im a boat')
;

insert into survey_data(survey_date, email, is_interested) values
    ('2019-01-01', 'stevens@pdx.edu', false),
    ('2019-01-01', 'betty@oregon.gov', false)
;

insert into committee(committee_id, name, description) values
    (1, 'Committee on Space Exploration', 'About exploring space'),
    (2, 'Committee on Committees', 'About committees'),
    (3, 'Committee on athletics', 'Sports stuff'),
    (4, 'Committee for advanced learning', 'Making folks smart'),
    (5, 'Committee on safety', 'Making people safe'),
    (6, 'Craft brewing committee', 'We make beer'),
    (7, 'Linux Committee', 'Open source stuff'),
    (8, 'Gaming Committee', 'We play games'),
    (9, 'Comp Sci Committee', 'We make apps like this one'),
    (10, 'Student Committee', 'We care about you')
;

insert into survey_choice(survey_date, email, choice_id, committee_id) values
    ('2019-01-01', 'wolsborn@pdx.edu', 1, 1),
    ('2019-01-01', 'wolsborn@pdx.edu', 2, 2),
    ('2019-01-01', 'wolsborn@pdx.edu', 3, 3),
    ('2019-01-01', 'wolsborn@pdx.edu', 4, 4),
    ('2019-01-01', 'ghopper@gmail.com', 1, 4),
    ('2019-01-01', 'ghopper@gmail.com', 2, 3),
    ('2019-01-01', 'ghopper@gmail.com', 3, 2),
    ('2019-01-01', 'ghopper@gmail.com', 4, 1),
    ('2019-01-01', 'newtons@gmail.com', 1, 5),
    ('2019-01-01', 'newtons@gmail.com', 2, 6),
    ('2019-01-01', 'newtons@gmail.com', 3, 7),
    ('2019-01-01', 'newtons@gmail.com', 4, 8),
    ('2019-01-01', 'name@pdx.edu', 1, 8),
    ('2019-01-01', 'name@pdx.edu', 2, 7),
    ('2019-01-01', 'name@pdx.edu', 3, 6),
    ('2019-01-01', 'name@pdx.edu', 4, 5),
    ('2019-01-01', 'boat@gmail.com', 1, 9),
    ('2019-01-01', 'boat@gmail.com', 2, 10),
    ('2019-01-01', 'boat@gmail.com', 3, 2),
    ('2019-01-01', 'boat@gmail.com', 4, 5)
;

insert into committee_assignment(email, committee_id, start_date, end_date) values
    ('wolsborn@pdx.edu', 8, '2019-1-1', '2020-1-1'),
    ('wolsborn@pdx.edu', 9, '2019-1-1', '2020-1-1'),
    ('wolsborn@pdx.edu', 10, '2019-1-1', '2020-1-1'),
    ('boat@gmail.com', 1, '2019-1-1', '2020-1-1'),
    ('boat@gmail.com', 2, '2019-1-1', '2020-1-1'),
    ('boat@gmail.com', 3, '2019-1-1', '2020-1-1'),
    ('ghopper@gmail.com', 1, '2019-1-1', '2020-1-1'),
    ('ghopper@gmail.com', 2, '2019-1-1', '2020-1-1'),
    ('ghopper@gmail.com', 3, '2019-1-1', '2020-1-1'),
    ('name@pdx.edu', 8, '2019-1-1', '2020-1-1'),
    ('name@pdx.edu', 9, '2019-1-1', '2020-1-1'),
    ('name@pdx.edu', 10, '2019-1-1', '2020-1-1'),
    ('newtons@gmail.com', 4, '2019-1-1', '2020-1-1'),
    ('newtons@gmail.com', 5, '2019-1-1', '2020-1-1'),
    ('newtons@gmail.com', 6, '2019-1-1', '2020-1-1'),
    ('newtons@gmail.com', 7, '2019-1-1', '2020-1-1'),
    ('betty@oregon.gov', 4, '2019-1-1', '2020-1-1'),
    ('betty@oregon.gov', 5, '2019-1-1', '2020-1-1'),
    ('betty@oregon.gov', 6, '2019-1-1', '2020-1-1'),
    ('betty@oregon.gov', 7, '2019-1-1', '2020-1-1')
;