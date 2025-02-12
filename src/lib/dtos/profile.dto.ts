import { z } from 'zod';

import { createZodDto } from '@zod';

const socialMediaSchema = z
	.object({
		github: z.string(),
		instagram: z.string(),
		linkedin: z.string(),
		pinterest: z.string(),
		reddit: z.string(),
		spotify: z.string(),
		steam: z.string(),
		twitch: z.string(),
		twitter: z.string(),
		youtube: z.string(),
	})
	.partial()
	.describe('The social media username map to social media name');

const updateProfileDtoSchema = z
	.object({
		mimeType: z.string().describe('The mime type of the background image'),
		showcaseCodes: z.array(z.string().nullable()).describe('The codes of the showcase cards'),
		premiumShowcaseCodes: z.array(z.string().nullable()).describe('The codes of the premium showcase cards'),
		about: z.string().describe('The about text of the profile'),
		socialMedia: socialMediaSchema.describe('The social media username map to social media name'),
	})
	.partial();

export class UpdateProfileDto extends createZodDto(updateProfileDtoSchema) {}
