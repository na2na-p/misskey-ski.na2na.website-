/**
 * Config loader
 */

import * as fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import * as yaml from 'js-yaml';
import { Source, Mixin } from './types.js';

const _filename = fileURLToPath(import.meta.url);
const _dirname = dirname(_filename);

/**
 * Path of configuration directory
 */
const dir = `${_dirname}/../../../../.config`;

/**
 * Path of configuration file
 */
const path = process.env.NODE_ENV === 'test'
	? `${dir}/test.yml`
	: `${dir}/default.yml`;

export default function load() {
	const meta = JSON.parse(fs.readFileSync(`${_dirname}/../../../../built/meta.json`, 'utf-8'));
	const clientManifest = JSON.parse(fs.readFileSync(`${_dirname}/../../../../built/_client_dist_/manifest.json`, 'utf-8'));
	const config = yaml.load(fs.readFileSync(path, 'utf-8')) as Source;

	// TODO: process.envから取得
	const url = tryCreateUrl(config.url);

	config.url = url.origin;

	config.port = config.port || parseInt(process.env.PORT || '', 10);

	const host: Mixin['host'] = url.hostname;
	const scheme: Mixin['scheme'] = url.protocol.replace(/:$/, '');
	const wsScheme: Mixin['wsScheme'] = scheme.replace('http', 'ws');

	const mixin: Mixin = {
		version: meta.version,
		host,
		hostname: url.hostname,
		scheme,
		wsScheme,
		wsUrl: `${wsScheme}://${host}`,
		apiUrl: `${scheme}://${host}/api`,
		authUrl: `${scheme}://${host}/auth`,
		driveUrl: `${scheme}://${host}/files`,
		userAgent: `Misskey/${meta.version} (${config.url})`,
		clientEntry: clientManifest['src/init.ts'],
	};

	if (!config.redis.prefix) config.redis.prefix = mixin.host;

	return Object.assign(config, mixin);
}

function tryCreateUrl(url: string) {
	try {
		return new URL(url);
	} catch (e) {
		throw `url="${url}" is not a valid URL.`;
	}
}
