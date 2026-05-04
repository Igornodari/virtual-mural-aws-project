import { parseISO, format } from 'date-fns';

export class DateTime {
	static convertToUtc(date: string) {
		const dateTime = new Date(date);
		const _format = format(dateTime, 'yyyy-MM-dd');
		return _format;
	}
	static convertToUTCDateFromBr(dateString: string) {
		const [day, month, year] = dateString.split('/').map(Number);
		return new Date(Date.UTC(year, month - 1, day));
	}

	static format(date: string | Date, formatStr: string) {
		if (date instanceof Date) {
			return format(date, formatStr);
		}
		return format(parseISO(date), formatStr);
	}

	static setStartTimeOfDay(date: string): Date {
		return DateTime.setMinutes(date, '00:00:00');
	}
	static setEndTimeOfDay(date: string): Date {
		return DateTime.setMinutes(date, '23:59:59');
	}

	static setMinutes(date: Date | string, minuteString: string, options?: { utc: boolean }) {
		if (!(minuteString.length >= 5 && minuteString.length <= 9)) {
			throw new Error('minute format invalid: format corret is 00:00 or 00:00:00');
		}
		const timeSplit = minuteString.split(':');
		let newDate;

		const dateInstance = new Date(date);
		if (options?.utc) {
			newDate = dateInstance.setUTCHours(Number(timeSplit[0]), Number(timeSplit[1]), 0, 0);
		} else {
			newDate = dateInstance.setHours(Number(timeSplit[0]), Number(timeSplit[1]), 0, 0);
		}

		return new Date(newDate);
	}

	static getMinSelectableTime(date: unknown): string {
		if (!(date instanceof Date) || isNaN(date.getTime())) {
			return '08:00';
		}
		const today = new Date();
		if (date.toDateString() === today.toDateString()) {
			const now = new Date();
			return `${now.getHours()}:${now.getMinutes()}`;
		}
		return '08:00';
	}

	static calculateDateDifference(date: string | Date, endDate?: string | Date): string {
		const givenDate = new Date(date);
		const now = endDate ? new Date(endDate) : new Date();

		// Verifica se a data fornecida é válida
		if (isNaN(givenDate.getTime())) {
			return 'Data inválida';
		}

		// Calcula a diferença em milissegundos
		const diff = now.getTime() - givenDate.getTime();

		if (diff < 0) {
			return '';
		}

		const msInSecond = 1000;
		const msInMinute = msInSecond * 60;
		const msInHour = msInMinute * 60;
		const msInDay = msInHour * 24;
		const msInWeek = msInDay * 7;

		const years = now.getFullYear() - givenDate.getFullYear();
		const months = years * 12 + (now.getMonth() - givenDate.getMonth());
		const weeks = Math.floor(diff / msInWeek);
		const days = Math.floor(diff / msInDay);
		const hours = Math.floor(diff / msInHour);
		const minutes = Math.floor(diff / msInMinute);
		const seconds = Math.floor(diff / msInSecond);

		if (years > 0) {
			return years === 1 ? `${years} ano` : `${years} anos`;
		}
		if (months > 0) {
			return months === 1 ? `${months} mês` : `${months} meses`;
		}
		if (weeks > 0) {
			return weeks === 1 ? `${weeks} semana` : `${weeks} semanas`;
		}
		if (days > 0) {
			return days === 1 ? `${days} dia` : `${days} dias`;
		}
		if (hours > 0) {
			return hours === 1 ? `${hours} hora` : `${hours} horas`;
		}
		if (minutes > 0) {
			return minutes === 1 ? `${minutes} minuto` : `${minutes} minutos`;
		}
		if (seconds > 0) {
			return seconds === 1 ? `${seconds} segundo` : `${seconds} segundos`;
		}
		return '';
	}

	static getFirstDayOfMonth(date?: string | Date) {
		date = date ? new Date(date) : new Date();

		return new Date(date.setUTCDate(1)); // Define o dia como 1
	}

	static getLastDayOfMonth(date?: string | Date) {
		date = date ? new Date(date) : new Date();
		const year = date.getUTCFullYear();
		const month = date.getUTCMonth() + 1; // Adiciona 1 porque os meses são zero-based
		return new Date(Date.UTC(year, month, 0));
	}

	static add(
		date: Date,
		options: {
			days?: number;
			weeks?: number;
			months?: number;
			years?: number;
		}
	) {
		// Cria uma nova instância de Date com base na data fornecida
		const result = new Date(date);

		// Adiciona dias
		if (options.days) {
			result.setDate(result.getDate() + options.days);
		}

		// Adiciona semanas
		if (options.weeks) {
			result.setDate(result.getDate() + options.weeks * 7);
		}

		// Adiciona meses
		if (options.months) {
			result.setMonth(result.getMonth() + options.months);
		}

		// Adiciona anos
		if (options.years) {
			result.setFullYear(result.getFullYear() + options.years);
		}

		return new Date(result);
	}
}
