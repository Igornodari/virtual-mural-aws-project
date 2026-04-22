// eslint-disable-next-line prefer-arrow/prefer-arrow-functions
export function getLeadScoreIcon(score: number): string {
	if (score >= 100) return '🔥🔥🔥';
	if (score >= 50) return '🔥🔥';
	if (score >= 20) return '🔥';
	return '❄️';
}
