
export class Event<Params> {
    private subscribers: ((p: Params) => void)[]

    constructor() {
        this.subscribers = []
    }

    subscribe(f: (p: Params) => void) {
        this.subscribers.push(f)
    }

    unSubscribe(f: (p: Params) => void) {
        for (let i = 0; i < this.subscribers.length; i++) {
            if (f == this.subscribers[i]) {
                this.subscribers.splice(i)
                return
            }
        }
    }

    invoke(params: Params) {
        for (const f of this.subscribers) 
            f(params)
    }
}