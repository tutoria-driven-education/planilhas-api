'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => await queryInterface.removeColumn('User','password'),

	down: async (queryInterface, Sequelize) => await queryInterface.addColumn('User','password',Sequelize.STRING)
};
