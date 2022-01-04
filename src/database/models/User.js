module.exports = (sequelize, DataTypes) => {
	const User = sequelize.define('User', {
		id: {
			allowNull: false,
			autoIncrement: true,
			primaryKey: true,
			type: DataTypes.INTEGER,
		},
		login: DataTypes.STRING,
		password: DataTypes.STRING,
		name: DataTypes.STRING,
		email: DataTypes.STRING,
	});
	return User;
};
