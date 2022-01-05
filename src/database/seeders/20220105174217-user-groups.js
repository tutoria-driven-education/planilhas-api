/* eslint-disable no-unused-vars */
'use strict';

module.exports = {
	up: async (queryInterface, _Sequelize) => {
		await queryInterface.bulkInsert('UserGroup', [
			{
				name: 'Tutores',
			},
			{
				name: 'Instrutores',
			},
			{
				name: 'Facilitadores',
			}]);
	},

	down: async (queryInterface, _Sequelize) => {
		await queryInterface.bulkDelete('UserGroup', null, {});
	}
};
