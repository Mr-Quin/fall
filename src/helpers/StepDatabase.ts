import Dexie from 'dexie'
import { Vector3 } from '@babylonjs/core'

export interface Step {
    id?: number
    position: Vector3
    note: number
    time: number
}

class StepDatabase extends Dexie {
    public steps: Dexie.Table<Step, number> // id is number in this case

    public constructor() {
        super('StepDatabase')
        this.version(1).stores({
            steps: '++id,step',
        })

        this.steps = this.table('steps')
        ;(window as any).stepDb = this
    }
}

export default StepDatabase
