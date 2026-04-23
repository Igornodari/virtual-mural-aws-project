export const titleCase = (str: string | undefined): string => {
	if (!str) return String();
	return str
		.toLowerCase()
		.split(' ')
		.map((word) => (word.length > 0 ? word[0].toUpperCase() + word.slice(1) : word))
		.join(' ');
};
