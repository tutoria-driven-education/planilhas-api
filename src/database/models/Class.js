const model = (sequelize, DataTypes) => {
	const Class = sequelize.define('Class', {
		id: {
			allowNull: false,
			autoIncrement: true,
			primaryKey: true,
			type: DataTypes.INTEGER,
		},
		instructorId: {
			type: DataTypes.STRING,
		},
		coordinatorId: {
			type: DataTypes.STRING,
		}
	}, {
		freezeTableName: true,
		timestamps: false
	});
	return Class;
};

export default model;