import React, { useState, useEffect } from 'react';

interface Props {
    name: string
}

interface Thing {
    foo: string
}

const getSomething = (myNum: number): Thing => {
    if (myNum === 0) {
        return {
            foo: 'bar'
        } as Thing
    }

    return {
        foo: 'baz'
    } as Thing
}

const Modal: React.FC<Props> = ({ name }) => {
    const [count, setCount] = useState<number>(0);

    // Similar to componentDidMount and componentDidUpdate:
    useEffect(() => {
        const thing = getSomething(count);
        // Update the document title using the browser API
        document.title = `You clicked ${count} times. Here's a thing: ${thing.foo}`;
    });

    return (
        <div>
            <h1>{name}</h1>
            <p>You clicked {count} times</p>
            <button onClick={() => setCount(count + 1)}>
                Click me
        </button>
        </div>
    );
}

export default Modal