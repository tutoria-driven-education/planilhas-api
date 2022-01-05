const model = (sequelize, DataTypes) => {
	const UserGroup = sequelize.define('UserGroup', {
		id: {
			allowNull: false,
			autoIncrement: true,
			primaryKey: true,
			type: DataTypes.INTEGER,
		},
		name: {
			allowNull: false,
			type: DataTypes.STRING,
		},
	}, {
		freezeTableName: true,
		timestamps: false
	});

	return UserGroup;
};

export default model;