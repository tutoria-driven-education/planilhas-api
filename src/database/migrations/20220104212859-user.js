'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => await queryInterface.createTable('User', {
		id: {
			allowNull: false,
			autoIncrement: true,
			primaryKey: true,
			type: Sequelize.INTEGER,
		},
		password: {
			type: Sequelize.STRING,
			allowNull: false,
		},
		name: {
			type: Sequelize.STRING,
			allowNull: false,
		},
		email: {
			type: Sequelize.STRING,
			allowNull: false,
		},
		slackId: {
			type: Sequelize.STRING,
		},
		UserGroupId: {
			type: Sequelize.STRING,
			allowNull: false
		},
	}),

	// eslint-disable-next-line no-unused-vars
	down: async (queryInterface, _Sequelize) => await queryInterface.dropTable('User'),
};

