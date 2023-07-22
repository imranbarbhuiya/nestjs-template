import { Buffer } from 'node:buffer';
import fs from 'node:fs/promises';

import { request } from 'undici';

import type { PathLike } from 'node:fs';

export const trim = (str: string, max: number, suffix: string = '...') =>
	str.length > max ? `${str.slice(0, max - suffix.length)}${suffix}` : str;
/**
 * Escapes regex patterns from a string
 * @param str
 * @returns
 */
export const escapeRegex = (str: string) => str.replaceAll(/[$()*+.?[\\\]^{|}]/g, '\\$&').replaceAll('-', '\\x2d');

/**
 * Get a random number from the given range
 */
export const randomNumber = (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1)) + min;

/**
 * Pick a given number of random elements from an array (without duplicates)

 */
export const getRandom = <T>(array: T[], amount: number): T[] => {
	const arr = [...array];

	if (!arr.length || !amount) {
		return [];
	}

	return Array.from(
		{ length: Math.min(amount, arr.length) },
		() => arr.splice(Math.floor(Math.random() * arr.length), 1)[0],
	);
};

/**
 * Returns random number between a range
 * @param min
 * @param max
 * @returns
 */

export const randomBetween = (min: number, max: number) => {
	return Math.floor(Math.random() * (max - min)) + min;
};

/**
 *
 * Fetches a buffer from a URL. If the URL is a local file and allowFS is true, it will read the file.
 * We use this to fetch buffer first then pass it to loadImage. This is because loadImage uses http/https
 * to fetch the image, which is slow. This is faster.
 *
 * @example
 * ```ts
 * const buffer = await fetchBuffer('https://example.com/image.png');
 * const image = await loadImage(buffer);
 * ```
 *
 * @param input The URL to fetch
 * @param allowFS Whether to allow reading from the filesystem.
 * Defaults to false for security reasons.
 * @returns The buffer
 */
export const fetchBuffer = async (
	input: Buffer | PathLike | string,
	allowFS: boolean = false,
): Promise<Buffer | null> => {
	if (!input) return null;
	if (Buffer.isBuffer(input)) return input;
	if (typeof input === 'string' && input.startsWith('http')) {
		const res = await request(input);
		const arrBuffer = await res.body.arrayBuffer();
		return Buffer.from(arrBuffer);
	}

	// In the future if needed, we should allow reading from any folder.

	return allowFS ? fs.readFile(input) : null;
};
