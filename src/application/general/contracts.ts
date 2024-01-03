const isDev = process.env.NODE_ENV === 'development'
type Pred = () => boolean

export function requires(condition: boolean | Pred, errMsg=''): void {
    if (isDev) {
        const res = typeof condition === 'boolean' ? condition : condition();
        if (!res)
            throw new Error(`Requires condition failed --\n:${errMsg}`)
    }
}

export function assert(condition: boolean | Pred, errMsg=''): void {
    if (isDev) {
        const res = typeof condition === 'boolean' ? condition : condition();
        if (!res)
            throw new Error(`Assert condition failed --\n:${errMsg}`)
    }
}

export function ensures(condition: boolean | Pred, errMsg=''): void {
    if (isDev) {
        const res = typeof condition === 'boolean' ? condition : condition();
        if (!res)
            throw new Error(`Ensures condition failed --\n:${errMsg}`)
    }
}

export function assertNotNull<T>(value: T | null | undefined, errMsg=''): asserts value is T {
    assert(value != null, errMsg)
}