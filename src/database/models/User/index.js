const model = (sequelize, DataTypes) => {
	const User = sequelize.define('User', {
		id: {
			allowNull: false,
			autoIncrement: true,
			primaryKey: true,
			type: DataTypes.INTEGER,
		},
		password: DataTypes.STRING,
		name: DataTypes.STRING,
		email: DataTypes.STRING,
	}, {
		freezeTableName: true,
		timestamps: false
	});
	return User;
};

export default model;