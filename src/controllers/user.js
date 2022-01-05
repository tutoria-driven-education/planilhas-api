/* eslint-disable no-unused-vars */
import bcrypt from 'bcrypt';

import * as models from '../database/models/index.js';

const { User, UserGroup } = models.default;

export async function login(req, res) {
	const { email, password } = req.body;

	const user = await User.findOne({
		where: {
			email
		}
	});

	if (user) {
		const validPassword = await bcrypt.compare(password, user.password);
		if (validPassword) {
			return res.status(200).json({ message: 'Valid password' });
		}
	}

	return res.status(400).json({ error: 'Login went wrong' });
}

export async function create(req, res) {
	const { email, name, password, slackId, userGroupId } = req.body;

	const salt = await bcrypt.genSalt(10);
	const pw = await bcrypt.hash(password, salt);

	const user = await User.create({
		name,
		password: pw,
		email,
		slackId,
		UserGroupId: userGroupId
	});
	if (user) {
		return res.status(200).json({ message: 'User created' });
	} else {
		return res.status(400).json({ error: 'An error has occured' });
	}

}

export async function getAll(req, res) {
	const user = await User.findAll({
		attributes: { exclude: ['UserGroupId'] },
		include: [{
			model: UserGroup,
			attributes: ['name']
		}]
	});

	if (user) {
		return res.status(200).json({ user });
	} else {
		return res.status(400).json({ error: 'Error getting all users' });
	}
}

export async function getAllGroups(req, res) {
	const userGroup = await UserGroup.findAll({
		include: User
	});

	if (userGroup) {
		return res.status(200).json({ userGroup });
	} else {
		return res.status(400).json({ error: 'Error getting all users groups' });
	}
}