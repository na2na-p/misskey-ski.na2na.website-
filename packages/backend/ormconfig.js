import { DataSource } from 'typeorm';
import _config from './built/config/index.js';
import { entities } from './built/db/postgre.js';

export default new DataSource({
	type: 'postgres',
	host: process.env.MISSKEY_DB_HOST || _config.db.host,
	port: process.env.MISSKEY_DB_PORT ? parseInt(process.env.MISSKEY_DB_PORT) : _config.db.port,
	username: process.env.MISSKEY_DB_USER || _config.db.user,
	password: process.env.MISSKEY_DB_PASS || _config.db.pass,
	database: process.env.MISSKEY_DB_NAME || _config.db.db,
	extra: process.env.MISSKEY_DB_EXTRA ? JSON.parse(process.env.MISSKEY_DB_EXTRA) : _config.db.extra,
	entities: entities,
	migrations: ['migration/*.js'],
});
