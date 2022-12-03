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
	const _config = yaml.load(fs.readFileSync(path, 'utf-8')) as Source;

	// TODO: 移行始めたらオプショナルなものについてはundefinedを詰めるようにする
	const config: Source = {
		url: process.env.MISSKEY_URL || _config.url,
		port: process.env.MISSKEY_PORT ? parseInt(process.env.MISSKEY_PORT) : _config.port,
		db: {
			host: process.env.MISSKEY_DB_HOST || _config.db.host,
			port: process.env.MISSKEY_DB_PORT ? parseInt(process.env.MISSKEY_DB_PORT) : _config.db.port,
			db: process.env.MISSKEY_DB_NAME || _config.db.db,
			user: process.env.MISSKEY_DB_USER || _config.db.user,
			pass: process.env.MISSKEY_DB_PASS || _config.db.pass,
			disableCache: Boolean(process.env.MISSKEY_DB_DISABLE_DB_CACHE) || _config.db.disableCache,
			extra: process.env.MISSKEY_DB_EXTRA ? JSON.parse(process.env.MISSKEY_DB_EXTRA) : _config.db.extra,
		},
		// 使用しない場合存在させてはいけない
		redis: {
			host: process.env.MISSKEY_REDIS_HOST || _config.redis.host,
			port: process.env.MISSKEY_REDIS_PORT ? parseInt(process.env.MISSKEY_REDIS_PORT) : _config.redis.port,
			family: process.env.MISSKEY_REDIS_FAMILY ? parseInt(process.env.MISSKEY_REDIS_FAMILY) : _config.redis.family,
			pass: process.env.MISSKEY_REDIS_PASS || _config.redis.pass,
			prefix: process.env.MISSKEY_REDIS_PREFIX || _config.redis.prefix,
			db: process.env.MISSKEY_REDIS_DB ? parseInt(process.env.MISSKEY_REDIS_DB) : _config.redis.db,
		},
		// 使用しない場合存在させてはいけない
		elasticsearch: {
			host: process.env.MISSKEY_ELASTICSEARCH_HOST || _config.elasticsearch.host,
			port: process.env.MISSKEY_ELASTICSEARCH_PORT ? parseInt(process.env.MISSKEY_ELASTICSEARCH_PORT) : _config.elasticsearch.port,
			ssl: process.env.MISSKEY_ELASTICSEARCH_SSL ? Boolean(process.env.MISSKEY_ELASTICSEARCH_SSL) : _config.elasticsearch.ssl,
			user: process.env.MISSKEY_ELASTICSEARCH_USER || _config.elasticsearch.user,
			pass: process.env.MISSKEY_ELASTICSEARCH_PASS || _config.elasticsearch.pass,
			// そもそもこれ必要なの？
			index: process.env.MISSKEY_ELASTICSEARCH_INDEX || _config.elasticsearch.index,
		},
		id: process.env.MISSKEY_ID || _config.id,
		disableHsts: Boolean(process.env.MISSKEY_DISABLE_HSTS) || _config.disableHsts,
		proxy: process.env.MISSKEY_PROXY || _config.proxy,
		proxySmtp: process.env.MISSKEY_PROXY_SMTP || _config.proxySmtp,
		proxyBypassHosts: process.env.MISSKEY_PROXY_BYPASS_HOSTS ? process.env.MISSKEY_PROXY_BYPASS_HOSTS.split(',') : _config.proxyBypassHosts,
		allowedPrivateNetworks: process.env.MISSKEY_ALLOWED_PRIVATE_NETWORKS ? process.env.MISSKEY_ALLOWED_PRIVATE_NETWORKS.split(',') : _config.allowedPrivateNetworks,
		maxFileSize: process.env.MISSKEY_MAX_FILE_SIZE ? parseInt(process.env.MISSKEY_MAX_FILE_SIZE) : _config.maxFileSize,
		// これ必要なの？
		accesslog: process.env.MISSKEY_ACCESSLOG || _config.accesslog,
		clusterLimit: process.env.MISSKEY_CLUSTER_LIMIT ? parseInt(process.env.MISSKEY_CLUSTER_LIMIT) : _config.clusterLimit,
		outgoingAddressFamily: (process.env.MISSKEY_OUTGOING_ADDRESS_FAMILY as Source['outgoingAddressFamily']) || _config.outgoingAddressFamily,
		deliverJobConcurrency: process.env.MISSKEY_DELIVER_JOB_CONCURRENCY ? parseInt(process.env.MISSKEY_DELIVER_JOB_CONCURRENCY) : _config.deliverJobConcurrency,
		inboxJobConcurrency: process.env.MISSKEY_INBOX_JOB_CONCURRENCY ? parseInt(process.env.MISSKEY_INBOX_JOB_CONCURRENCY) : _config.inboxJobConcurrency,
		deliverJobPerSec: process.env.MISSKEY_DELIVER_JOB_PER_SEC ? parseInt(process.env.MISSKEY_DELIVER_JOB_PER_SEC) : _config.deliverJobPerSec,
		inboxJobPerSec: process.env.MISSKEY_INBOX_JOB_PER_SEC ? parseInt(process.env.MISSKEY_INBOX_JOB_PER_SEC) : _config.inboxJobPerSec,
		deliverJobMaxAttempts: process.env.MISSKEY_DELIVER_JOB_MAX_ATTEMPTS ? parseInt(process.env.MISSKEY_DELIVER_JOB_MAX_ATTEMPTS) : _config.deliverJobMaxAttempts,
		inboxJobMaxAttempts: process.env.MISSKEY_INBOX_JOB_MAX_ATTEMPTS ? parseInt(process.env.MISSKEY_INBOX_JOB_MAX_ATTEMPTS) : _config.inboxJobMaxAttempts,
		syslog: {
			host: process.env.MISSKEY_SYSLOG_HOST || _config.syslog.host,
			port: process.env.MISSKEY_SYSLOG_PORT ? parseInt(process.env.MISSKEY_SYSLOG_PORT) : _config.syslog.port,
		},
		mediaProxy: process.env.MISSKEY_MEDIA_PROXY || _config.mediaProxy,
		proxyRemoteFiles: Boolean(process.env.MISSKEY_PROXY_REMOTE_FILES) || _config.proxyRemoteFiles,
		signToActivityPubGet: Boolean(process.env.MISSKEY_SIGN_TO_ACTIVITY_PUB_GET) || _config.signToActivityPubGet,
	};

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
