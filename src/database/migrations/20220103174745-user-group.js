'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => await queryInterface.createTable('UserGroup', {
		id: {
			allowNull: false,
			autoIncrement: true,
			primaryKey: true,
			type: Sequelize.INTEGER,
		},
		name: {
			type: Sequelize.STRING,
			allowNull: false,
		},
	}),

	// eslint-disable-next-line no-unused-vars
	down: async (queryInterface, _Sequelize) => await queryInterface.dropTable('UserGroup'),
};

