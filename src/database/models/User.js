const model = (sequelize, DataTypes) => {
	const User = sequelize.define('User', {
		id: {
			allowNull: false,
			autoIncrement: true,
			primaryKey: true,
			type: DataTypes.INTEGER,
		},
		password: {
			allowNull: false,
			type: DataTypes.STRING,
		} ,
		name: {
			allowNull: false,
			type: DataTypes.STRING,
		} ,
		email: {
			allowNull: false,
			type: DataTypes.STRING,
		},
	}, {
		freezeTableName: true,
		timestamps: false
	});
	return User;
};

export default model;