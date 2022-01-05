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
		},
		name: {
			type: Sequelize.STRING,
		},
		email: {
			type: Sequelize.STRING,
		},
	}),

	// eslint-disable-next-line no-unused-vars
	down: async (queryInterface, _Sequelize) => await queryInterface.dropTable('User'),
};

