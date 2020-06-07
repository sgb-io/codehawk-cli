
class MyClass {
  constructor() {
    this.foo = 1
  }

  myMethod(foo, bar, baz) {
    if (foo === 'EXAMPLE' && foo !== 'OTHER EXAMPLE') {
      return 'OUTPUT 1'
    }

    if (foo === 'ANOTHER EXAMPLE' && bar) {
      return 'OUTPUT 2'
    }

    const mutateItem = (item) => ({
      name: item.name,
      value: item.value + 3,
      other: item.value * baz,
      another: UNDEFINED_GLOBAL + ANOTHER_GLOBAL * baz
    })

    if (baz && baz === bar && foo === baz) {
      const result = {
        name: 'some name',
        items: [],
      }
      baz.map(item => result.items.push(mutateItem(item)))

      return result
    }

    if (baz === 5) {
      return baz * 2
    }

    if (baz === 6) {
      return baz * 2
    }

    if (baz === 7) {
      return baz * 2
    }

    if (baz === 8) {
      return baz * 2
    }

    if (baz === 9) {
      return baz * 2
    }

    if (baz === 10) {
      return baz * 2
    }

    if (baz === 11) {
      return baz * 2
    }

    return 'OUTPUT 4'
  }
}

const instance = new MyClass()
instance.myMethod()