import './PopoutMenu.css'
import React from 'react'
import PropTypes from 'prop-types'
import classcaded from '../../../utils/classcaded'
import Icon from '../Icon/Icon'

class PopoutMenu extends React.Component {
    constructor(props) {
        super(props)
        this.id = props.id || `id_${Math.random()}`
        this.state = {
            isOpen: false,
            hasCapture: false,
            searchTerm: '',
        }
        this.ref = React.createRef()
    }

    componentDidUpdate() {
        // Adjust the dropdown area upwards if it goes off the bottom
        const dropdownArea = this.ref.current
        if (dropdownArea) {
            const rect = dropdownArea.getBoundingClientRect()
            const bottomOverlap = rect.bottom - window.innerHeight
            if (bottomOverlap > 0) {
                const newMarginTop = (-bottomOverlap) - 30
                dropdownArea.style.marginTop = `${newMarginTop}px`
            }
        }
    }

    onChange = (event) => {
        this.setState({ searchTerm: event.target.value })
    }

    onClickTrigger() {
        this.setState(prevState => ({
            isOpen: !prevState.isOpen,
        }))
    }

    onClickItem() {
        this.setState({ isOpen: false, searchTerm: '' })
    }

    onBlur() {
        if (!this.state.hasCapture) this.setState({ isOpen: false, searchTerm: '' })
    }

    onMouseLeave() {
        this.setState({ hasCapture: false })
    }

    onMouseEnter() {
        this.setState({ hasCapture: true })
    }

    renderTrigger() {
        const { renderTrigger } = this.props
        const element = renderTrigger ?
            renderTrigger(this.state.isOpen, this.state.isHovered) :
            <button>Click me!</button>

        return React.cloneElement(element, {
            key: `popout-menu-${this.id}-trigger`,
            className: classcaded('popout-menu-trigger', element.props.className),
            onClick: (e) => {
                e.stopPropagation()
                e.preventDefault()
                if (element.props.onClick) element.props.onClick(e)
                this.onClickTrigger(e)
            }
        })
    }

    renderOptions() {
        const { options, renderOption, isSearchable } = this.props
        let filteredOptions = options
        if (isSearchable) {
            filteredOptions = options.filter(option =>
                option.label.toLowerCase().indexOf(this.state.searchTerm.toLowerCase()) !== -1
            )

            filteredOptions = filteredOptions.length ?
                filteredOptions : [{ label: 'No results Found', onClick: () => { } }]
        }

        return filteredOptions.map((option, i) => {
            const element = typeof renderOption === 'function' ? renderOption(option) : option
            return React.cloneElement(element, {
                key: `popout-menu-${this.id}-item-${i+1}`,
                className: classcaded('popout-menu-item', element.props.className),
                onClick: (e) => {
                    e.stopPropagation()
                    e.preventDefault()
                    if (element.props.onClick) element.props.onClick(e)
                    this.onClickItem(e)
                }
            })
        })
    }

    renderSearchOptions = () =>
        (<div className="popout-menu__search" key="popout-menu-search">
            <Icon
                fill="var(--ap-color-ui-grey-base)"
                className="popout-menu__search-icon"
                name="spotlight"
            />
            <input
                id="list-search"
                key={`popout-menu-${this.id}-search-bar`}
                className="popout-menu__search-bar"
                aria-label="Search through list"
                type="search"
                onChange={(event) => {
                    this.onChange(event)
                }}
            />
        </div >)


    render() {
        const { align, className, isSearchable } = this.props
        return (
            <div className="popout-menu"
                onBlur={e => this.onBlur(e)}
            >
                {this.renderTrigger()}
                {this.state.isOpen && (
                    <div
                        className={classcaded(
                            'popout-menu-options',
                            align && `align-${align}`, className
                        )}
                        onMouseLeave={e => this.onMouseLeave(e)}
                        onMouseEnter={e => this.onMouseEnter(e)}
                        ref={this.ref}
                    >
                        {isSearchable && this.renderSearchOptions()}
                        {this.renderOptions()}
                    </div>
                )}
            </div>
        )
    }
}

PopoutMenu.propTypes = {
    id: PropTypes.string,
    options: PropTypes.arrayOf(PropTypes.shape({
        label: PropTypes.string,
        onClick: PropTypes.func
    })),
    renderTrigger: PropTypes.func,
    renderOption: PropTypes.func,
    align: PropTypes.string,
    isSearchable: PropTypes.bool,
}

PopoutMenu.defaultProps = {
    id: undefined,
    options: [],
    renderOption: null,
    renderTrigger: null,
    align: '',
    isSearchable: false,
}

export default PopoutMenu