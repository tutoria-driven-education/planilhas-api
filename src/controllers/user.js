/* eslint-disable no-unused-vars */
import bcrypt from 'bcrypt';

import * as models from '../database/models/index.js';

export async function login(req, res) {
	const { email, password } = req.body;

	const user = await models.default.User.findOne({
		where: {
			email
		}
	});

	if (user) {
		// check user password with hashed password stored in the database
		const validPassword = await bcrypt.compare(password, user.password);
		if (validPassword) {
			return res.status(200).json({ message: 'Valid password' });
		} 
	}

	return res.status(400).json({ error: 'Login went wrong' });
}

export async function create(req, res) {
	const { email, name, password } = req.body;

	const salt = await bcrypt.genSalt(10);
	const pw = await bcrypt.hash(password, salt);

	const user = await models.default.User.create({
		name,
		password: pw,
		email
	});

	if (user) {
		return res.status(200).json({ message: 'User created' });
	} else {
		return res.status(400).json({ error: 'An error has occured' });
	}
}
