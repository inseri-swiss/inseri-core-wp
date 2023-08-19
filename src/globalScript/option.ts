type FnOrVal<A, B> = ((a: A) => B) | B

function isFunction<A, B>(f: ((a: A) => B) | B | A): f is (a: A) => B {
	return typeof f === 'function'
}

function makeFnOrVal<A, B>(fn: FnOrVal<A, B>): (a: A) => B {
	return (a: A) => (isFunction(fn) ? fn(a) : fn)
}

abstract class Option<A> {
	abstract isEmpty(): boolean

	abstract get(): A

	isDefined(): boolean {
		return !this.isEmpty()
	}

	getOrElse<B extends A>(defaultVal: FnOrVal<void, B>): A | B {
		if (this.isEmpty()) {
			return makeFnOrVal(defaultVal)(void 0)
		}
		return this.get()
	}

	map<B>(f: (a: A) => B): Option<B> {
		return this.isEmpty() ? none : some<B>(f(this.get()))
	}

	fold<B>(ifEmpty: () => B, ifDefined: (a: A) => B): B {
		return this.isEmpty() ? ifEmpty() : ifDefined(this.get())
	}

	flatMap<B>(f: (a: A) => Option<B>): Option<B> {
		return this.isEmpty() ? none : f(this.get())
	}

	filter(predicate: ((a: A) => boolean) | A): Option<A> {
		return this.flatMap((val) => {
			if (isFunction(predicate)) {
				return predicate(val) ? some(val) : none
			}
			return predicate === val ? some(val) : none
		})
	}

	exists(predicate: (a: A) => boolean): boolean {
		return this.isDefined() && predicate(this.get())
	}

	contains(elem: A): boolean {
		return this.isDefined() && this.get() === elem
	}

	orElse(alternative: Option<A>): Option<A> {
		if (this.isEmpty()) {
			return alternative
		}
		return this
	}

	equals(target: Option<A>): boolean {
		return (this.isDefined() && target.isDefined() && this.get() === target.get()) || (this.isEmpty() && target.isEmpty())
	}

	*[Symbol.iterator]() {
		if (this.isDefined()) {
			yield this.get()
		}
	}
}

class Some<A> extends Option<A> {
	constructor(private readonly x: A) {
		super()
	}

	isEmpty(): boolean {
		return false
	}

	get(): A {
		return this.x
	}
}

class None<A> extends Option<A> {
	isEmpty(): boolean {
		return true
	}

	get(): A {
		throw new RangeError('none.get()')
	}
}

const none = new None<any>()

const some = <A>(x: A): Option<A> => {
	if (x === null || typeof x === 'undefined') {
		return none as Option<A>
	}
	return new Some(x as A)
}

const option = some

export { none, some, option, Option }
