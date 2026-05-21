// TODO
import * as vm from "vm";

export class MathWorkerLike {
    context: vm.Context;
    constructor() {
        this.context = vm.createContext(Math);
    }
    eval(exp: string) {
        return vm.runInContext(exp, this.context)
    }
}

const myWorker = new MathWorkerLike();