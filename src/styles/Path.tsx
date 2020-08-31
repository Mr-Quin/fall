import styled from 'styled-components'

const Path = styled.path.attrs((props: { color?: string | number}) => ({
    setColor: () => {
        if (typeof props.color === "string") return props.color;
        if (typeof props.color === "number") return `hsl(${props.color || 0}, 70%, 90%)`
        return 'white'
    }
}))`
    filter: url(#glow);
    &:hover{
        cursor: pointer;
    }
`

const StyledPath = styled(Path)`
    fill: transparent;
    stroke: ${props => props.setColor()};
    stroke-width: 2px;
    stroke-linecap: round;
    stroke-linejoin: round;
`

const StyledCircle = styled(Path)`
    fill: ${props => props.setColor()};
    stroke: transparent;
`

export { StyledPath, StyledCircle }
