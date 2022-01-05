'use strict';

import Sequelize from 'sequelize';

import userModel from './User/index.js';

import config from '../config/database.json';

const db = {};

let sequelize;

if (config['development']) {
	sequelize = new Sequelize(config['development']);
} else {
	sequelize = new Sequelize(config.database, config.username, config.password, config);
}

[
	userModel
].map((model) => {
	const instance = model(sequelize, Sequelize.DataTypes);
	db[instance.name] = instance;
});


Object.keys(db).forEach(modelName => {
	if (db[modelName].associate) {
		db[modelName].associate(db);
	}
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;
