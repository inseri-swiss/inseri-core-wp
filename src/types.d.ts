declare module '*.png' {
	const value: any
	export = value
}

declare module '*.svg' {
	const value: any
	export = value
}

declare const inseriApiSettings: {
	root: string
	nonce: string
}

type RecursivePartial<T> = {
	[P in keyof T]?: T[P] extends (infer U)[] ? RecursivePartial<U>[] : T[P] extends object ? RecursivePartial<T[P]> : T[P]
}
