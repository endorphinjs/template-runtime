import assert from 'assert';
import document from './assets/document';
import { createComponent, mountComponent, unmountComponent } from '../runtime';
import { mounted } from './samples/unmount/unmount-beacon';
import * as UnmountCondition from './samples/unmount/unmount-condition';

describe.only('Unmount', () => {
	before(() => global.document = document);
	after(() => delete global.document);
	afterEach(() => mounted.length = 0);

	function calcRefs(vars) {
		let refs = 0;
		for (const p in vars) {
			if (p.startsWith('$_') && vars[p] != null) {
				refs++;
			}
		}

		return refs;
	}

	it('should unmount block', () => {
		const component = createComponent('unmount-condition', UnmountCondition);

		mountComponent(component, {
			enabled: true,
			alt: false
		});
		assert.deepEqual(mounted, [1, 2, 4]);

		component.setProps({ alt: true });
		assert.deepEqual(mounted, [1, 2, 3]);

		component.setProps({ enabled: false });
		assert.deepEqual(mounted, [1]);

		component.setProps({ enabled: true });
		assert.deepEqual(mounted, [1, 2, 3]);

		const { vars } = component.componentModel;
		unmountComponent(component);
		assert.deepEqual(mounted, []);

		assert.strictEqual(calcRefs(vars), 0);
	});
});
