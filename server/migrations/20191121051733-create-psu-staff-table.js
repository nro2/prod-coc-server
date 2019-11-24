'use strict';

var dbm;
var type;
var seed;

/**
  * We receive the dbmigrate dependency from dbmigrate initially.
  * This enables us to not have to rely on NODE_PATH.
  */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = function (db) {
    return db.createTable('psu_staff', {
        id: { type: 'int', primaryKey: true },
        first_name: 'string',
        last_name: 'string',
        committee_name: 'string'
    })
        .then(
            function (result) {
                db.createTable('Faculty', {
                    id: { type: 'int', primaryKey: true },
                    name: 'string',
                    email: 'string',
                    phone: 'string',
                    department: 'string'
                });
            },
            function (err) {
                return;
            }
        );
};

exports.down = function(db) {
    return db.dropTable('psu_staff')
        .then(
            function (result) {
                db.dropTable('Faculty');
            },
            function (err) {
                return;
            }
        );
};

exports._meta = {
  "version": 1
};
