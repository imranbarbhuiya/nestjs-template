import { trim } from './util';

describe('Util', () => {
	test('trim', () => {
		expect(trim('Hello World', 8)).toBe('Hello...');
	});
});
