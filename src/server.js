import app from './app.js';
import sequelize from './database/index.js';

sequelize
	.authenticate()
	.then(() => {
		console.log('Connection to database established successfully.');
	})
	.catch(err => {
		console.log('Unable to connect to the database: ', err);
	});

const port = process.env.PORT || 4000;
app.listen(port, () => {
	console.log(`server runing in port ${port}`);
});
