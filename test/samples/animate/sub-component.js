import { text } from "../../../dist/runtime.es.js";

export default function $$template0(host) {
	const target0 = host.componentView;
	target0.appendChild(text("Sub component"));
}


export function willUnmount(component) {
	console.log('component unmounted');
}

