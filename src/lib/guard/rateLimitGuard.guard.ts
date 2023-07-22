import { setTimeout } from 'node:timers';

import {
	BadGatewayException,
	HttpStatus,
	HttpException,
	Injectable,
	type ExecutionContext,
	type CanActivate,
} from '@nestjs/common';

import { TokenBucket } from '../../util/TokenBucket';

import type { Request } from 'express';

const userLimiters: Map<string, Map<string, TokenBucket>> = new Map();
const routeLimits: Map<string, { bucketSize: number; maxTokenUsePerSecond: number; route: string }> = new Map();

@Injectable()
export class RateLimitGuard implements CanActivate {
	private readonly bucketSize: number;

	private readonly maxTokenUsePerSecond: number;

	/**
	 * The bucket size and the max token use per second determine the rate at which tokens are added to and taken from the token bucket.
	 *
	 * The choice of bucket size and max token use per second depends on the specific use case. If you want to limit the rate at which requests are made,
	 * you could set the max token use per second to the maximum number of requests you want to allow in a second and set the bucket size to a number that
	 * would allow for some burst usage without exceeding the max token use per second.
	 * In general, it's a trade-off between allowing burst usage and limiting the overall rate of usage.
	 *
	 * @param bucketSize The bucket size represents the maximum number of tokens that the bucket can hold at a time.
	 * Once the number of tokens in the bucket reaches the bucket size, no more tokens will be added until some tokens are consumed.
	 *
	 * @param maxTokenUsePerSecond The max token use per second represents the maximum number of tokens that can be consumed from the bucket in a second.
	 * This value sets the rate at which the tokens are being consumed.
	 *
	 * In this example, the token bucket is created with a bucketSize of 100 and a maxTokenUsePerSecond of 100 / 60, meaning 100 tokens per 60 seconds,
	 * which is equivalent to 100 API calls per 60 seconds. The makeApiCall function will first check if a token can be taken from
	 * the bucket using the takeToken method.
	 * If the rate limit is not exceeded, it makes the API call. If the rate limit is exceeded, it waits for 1 second and calls itself again.
	 * @example
	 * ```ts
	 * const bucketSize = 100;
	 * const maxTokenUsePerSecond = 100 / 60;
	 * const tokenBucket = new TokenBucket(bucketSize, maxTokenUsePerSecond);
	 * async function makeApiCall() {
	 *  if (tokenBucket.takeToken()) {
	 *   // make the API call here
	 *   console.log('API call made');
	 *  } else {
	 *   console.log('Rate limit exceeded, waiting for next refill...');
	 *   await sleep(1000);
	 *   makeApiCall();
	 *  }
	 * }
	 *
	 * for (let i = 0; i < 150; i++) {
	 *  makeApiCall();
	 * }
	 * ```
	 */
	constructor(bucketSize: number, maxTokenUsePerSecond: number) {
		this.bucketSize = bucketSize;
		this.maxTokenUsePerSecond = maxTokenUsePerSecond;
	}

	public canActivate(context: ExecutionContext) {
		const req = context.switchToHttp().getRequest<Request>();
		const userId = req.user?.id;
		const route: string = req.route.path;
		const ip = (req.headers['x-forwarded-for'] as string | undefined)?.split(',')[0] ?? req.socket.remoteAddress;

		const cacheKey = userId ?? ip;

		if (!cacheKey) throw new BadGatewayException('Hmm... Something feels fishy.');

		if (!routeLimits.has(route)) {
			routeLimits.set(route, {
				bucketSize: this.bucketSize,
				maxTokenUsePerSecond: this.maxTokenUsePerSecond,
				route,
			});
		}

		const routeLimit = routeLimits.get(route)!;

		if (!userLimiters.has(cacheKey)) {
			userLimiters.set(cacheKey, new Map());
			setTimeout(() => userLimiters.delete(cacheKey), 60 * 1_000 * 30);
		}

		const userRoutes = userLimiters.get(cacheKey)!;

		let rateLimiter = userRoutes.get(route);
		if (!rateLimiter) {
			rateLimiter = new TokenBucket(routeLimit.bucketSize, routeLimit.maxTokenUsePerSecond);
			userRoutes.set(route, rateLimiter);
		}

		const tokenTaken = rateLimiter.takeToken();
		if (!tokenTaken) throw new HttpException('You are being rate limited.', HttpStatus.TOO_MANY_REQUESTS);
		return true;
	}
}
