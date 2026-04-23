export const download = (res: Blob, name: string) => {
	const url = window.URL.createObjectURL(res);
	const a = document.createElement('a');
	a.href = url;
	a.download = name;
	a.click();
	window.URL.revokeObjectURL(url);
};
