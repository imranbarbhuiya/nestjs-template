import 'express';
// import type { IUser } from '#app/mongoose';

declare global {
	namespace Express {
		export interface User {
			id: string;
		}
	}
}
