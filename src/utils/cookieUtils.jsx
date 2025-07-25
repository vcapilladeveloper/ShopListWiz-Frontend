export const setCookie = (name, value, days) => {
	let expires = "";
	if (days) {
		const date = new Date();
		date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
		expires = "; expires=" + date.toUTCString();
	}
	// Asegúrate de que el path sea '/' para que la cookie esté disponible en toda la aplicación.
	document.cookie = name + "=" + (value || "") + expires + "; path=/; SameSite=Lax"; // Añadido SameSite=Lax por seguridad
};

export const getCookie = (name) => {
	const nameEQ = name + "=";
	const ca = document.cookie.split(';');
	for (let i = 0; i < ca.length; i++) {
		let c = ca[i];
		while (c.charAt(0) === ' ') c = c.substring(1, c.length);
		if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
	}
	return null;
};

export const deleteCookie = (name) => {
	// Para eliminar una cookie, establece su fecha de expiración en el pasado o usa Max-Age=0
	document.cookie = name + '=; Max-Age=-99999999; path=/; SameSite=Lax';
};