/**
 * Runs animation, defined as `animation:${type}` attribute of `elem`
 * and call `callback` when ts finished
 * @param {HTMLElement} elem
 * @param {string} type
 * @param {function} callback
 */
export function animate(elem, type, callback) {
	const cssKey = 'animation';
	const anim = elem.getAttribute('animation:' + type);

	// Make sure animation is defined and browser supports it
	if (anim && cssKey in elem.style) {
		const animName = anim.trim().split(' ')[0];
		const handler = evt => {
			if (evt.animationName === animName) {
				elem.removeEventListener('animationend', handler);
				elem.removeEventListener('animationcancel', handler);
				elem.style[cssKey] = '';
				callback && callback(elem);
			}
		};

		elem.addEventListener('animationend', handler);
		elem.addEventListener('animationcancel', handler);
		elem.style[cssKey] = anim;
	} else if (callback) {
		callback(elem);
	}
}
