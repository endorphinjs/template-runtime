import { createComponent, insert, addDisposable, mountComponent, updateComponent, mountBlock, updateBlock, createInjector } from "../../runtime";
import * as SubComponent1 from "sub-component1.html";
import * as SubComponent2 from "sub-component2.html";

export default function $$template0(host, scope) {
	const target0 = host.componentView;
	const injector0 = createInjector(target0);
	const subComponent10 = scope.$_subComponent10 = insert(injector0, createComponent("sub-component1", SubComponent1, host));
	addDisposable(host, subComponent10);
	mountComponent(subComponent10);
	scope.$_block1 = mountBlock(host, injector0, $$conditionEntry0);
	addDisposable(host, scope.$_block1.block);
	return $$template0Update;
}

function $$template0Update(host, scope) {
	updateComponent(scope.$_subComponent10);
	updateBlock(scope.$_block1);
	return 0;
}

function $$conditionContent1(host, injector, scope) {
	const subComponent20 = scope.$_subComponent21 = insert(injector, createComponent("sub-component2", SubComponent2, host));
	addDisposable(injector, subComponent20);
	mountComponent(subComponent20);
	return $$conditionContent1Update;
}

function $$conditionContent1Update(host, injector, scope) {
	updateComponent(scope.$_subComponent21);
	return 0;
}

function $$conditionEntry1(host) {
	if (host.props.enabled2) {
		return $$conditionContent1;
	} 
}

function $$conditionContent0(host, injector, scope) {
	const subComponent20 = scope.$_subComponent20 = insert(injector, createComponent("sub-component2", SubComponent2, host));
	addDisposable(injector, subComponent20);
	mountComponent(subComponent20);
	scope.$_block0 = mountBlock(host, injector, $$conditionEntry1);
	addDisposable(injector, scope.$_block0.block);
	return $$conditionContent0Update;
}

function $$conditionContent0Update(host, injector, scope) {
	updateComponent(scope.$_subComponent20);
	updateBlock(scope.$_block0);
	return 0;
}

function $$conditionEntry0(host) {
	if (host.props.enabled1) {
		return $$conditionContent0;
	} 
}
