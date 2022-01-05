export default function applyAssociations(sequelize) {
	const { User, UserGroup } = sequelize.models;

	UserGroup.hasMany(User);
	User.belongsTo(UserGroup);
}

