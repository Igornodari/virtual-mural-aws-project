import { Timestamp } from "rxjs";

export interface Notifications {
	body: string;
	createdAt: Timestamp<Date>;
	detailId: number;
	module: string;
	platform: string[];
	isOpened: boolean;
	title: string;
	id: string;
	userId: string;
	link?: string;
}

interface profiledd {
	id: number;
	img: string;
	title: string;
	subtitle: string;
	link: string;
}

export const profiledd: profiledd[] = [
	{
		id: 1,
		img: '/assets/images/svgs/icon-account.svg',
		title: 'PROFILE_NAME',
		subtitle: 'PROFILE_DESCRIPTION',
		link: 'account',
		// },
		// {
		//   id: 2,
		//   img: '/assets/images/svgs/icon-inbox.svg',
		//   title: 'PROFILE_SLACK',
		//   subtitle: 'PROFILE_SLACK_DESCRIPTION',
		//   link: '/',
		// },
		// {
		//   id: 3,
		//   img: '/assets/images/svgs/icon-tasks.svg',
		//   title: 'PROFILE_ZOHO',
		//   subtitle: 'PROFILE_ZOHO_DESCRIPTION',
		//   link: '/',
	},
];

export const moduleRoutes: { [key: string]: string } = {
	maintenance: 'facilities/maintenances/detail/',
	feedbacks: 'interactions/feedback/',
	visits: 'interactions/visits/',
};

export const selectedLanguage: any = {
	language: 'HEADER.LANGUAGES.PORTUGUESE',
	code: 'pt',
	type: 'BR',
	icon: '/assets/images/flag/icon-flag-br.png',
};
export const languages: any[] = [
	{
		language: 'HEADER.LANGUAGES.PORTUGUESE',
		code: 'pt',
		type: 'BR',
		icon: '/assets/images/flag/icon-flag-br.png',
	},
	{
		language: 'HEADER.LANGUAGES.ENGLISH',
		code: 'en',
		type: 'US',
		icon: '/assets/images/flag/icon-flag-en.svg',
	},
];
