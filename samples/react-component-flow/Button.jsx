// @flow

import * as React from 'react'
import pick from 'lodash/pick'
import classcaded from '../../../utils/classcaded'
import './Button.css'

const BUTTON_CLASSES = [
    'primary',
    'primary-inverted',
    'secondary',
    'secondary-inverted',
    'disabled',
    'disabled-inverted',
    'danger',
    'danger-inverted',
    'warning',
    'warning-inverted',
    'link',
    'sm',
    'xs',
]

type Props = {
    type?: string,
    onClick?: any,
    onMouseEnter?: () => void,
    onMouseLeave?: () => void,
    className?: string,
    children?: any,
}

const hasDisabledProps = (props: any) => {
    const disabledAttributes = ['disabled', 'disabled-inverted']
    return disabledAttributes.some(attr => !!props[attr])
}

const Button = (props: Props) => {
    const {
        className,
        type,
        onClick,
        children,
    } = props
    const isDisabled = hasDisabledProps(props)
    const resolveTypes = Object.keys(pick(props, BUTTON_CLASSES))
    const resolvedClasses = resolveTypes && resolveTypes.length ? (
        resolveTypes
            .filter(subType =>
                !isDisabled ? !['disabled', 'disabled-inverted'].includes(subType) : true
            )
            .map(subType => `btn-${subType}`)
    ) : []

    return (
        <button
            className={classcaded(
                'btn',
                ...resolvedClasses,
                className,
            )}
            type={type}
            disabled={isDisabled}
            onClick={onClick}
            onMouseEnter={props.onMouseEnter}
            onMouseLeave={props.onMouseLeave}
        >
            {children}
        </button>
    )
}

Button.defaultProps = {
    type: 'button',
    onClick: () => undefined,
    onMouseEnter: () => { },
    onMouseLeave: () => { },
    className: '',
    children: null
}

export default Button
