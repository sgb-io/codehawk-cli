export const utilA = (someString) => (
    someString.split('a')
)

export const utilB = (someString, someNumber) => {
    const name = `Cool Name - ${someNumber}, (${utilA(someString)})`

    if (someNumber === 0) {
        return 1
    }

    if (someNumber < 0) {
        return 'Some other output'
    } else if (someNumber > 1) {
        if (someNumber === 100) {
            return 'Exactly 100'
        } else {
            return name
        }
    }

    return name
}
