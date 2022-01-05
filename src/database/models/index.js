import Sequelize from 'sequelize';

import applyAssociations from './utils/associations.js';

import userModel from './User.js';
import userGroupModel from './UserGroup.js';
import classModel from './Class.js';

import config from '../config/database.json';

const db = {};

let sequelize;

// TODO: use env variables
if (config['development']) {
	sequelize = new Sequelize(config['development']);
} else {
	sequelize = new Sequelize(config.database, config.username, config.password, config);
}

[
	userModel,
	userGroupModel,
	classModel
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

applyAssociations(sequelize);

export default db;
