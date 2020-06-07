import { EXAMPLE_CONSTANT_2, EXAMPLE_CONSTANT_3 } from './sample-es6-constants'
import { utilA, utilB } from './utils'

const exampleUtilityFunc = (a, b) => {
    if (a === EXAMPLE_CONSTANT_2) {
        return true
    }

    if (a === EXAMPLE_CONSTANT_3) {
        return utilB(b)
    }

    return utilA(a)
}

exampleUtilityFunc(EXAMPLE_CONSTANT_2, 'foo') // true
exampleUtilityFunc(EXAMPLE_CONSTANT_3, 'foo') // false
exampleUtilityFunc(undefined, 'foo') // 'foo'
