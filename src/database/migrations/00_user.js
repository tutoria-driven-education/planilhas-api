module.exports = {
	up: (queryInterface, Sequelize) => queryInterface.createTable('User', {
		id: {
			allowNull: false,
			autoIncrement: true,
			primaryKey: true,
			type: Sequelize.INTEGER,
		},
		login: {
			type: Sequelize.STRING,
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
		createdAt: {
			allowNull: false,
			type: Sequelize.DATE,
		},
		updatedAt: {
			allowNull: false,
			type: Sequelize.DATE,
		},
	}),

	// eslint-disable-next-line no-unused-vars
	down: (queryInterface, _Sequelize) => queryInterface.dropTable('User'),
};
