import { useState } from 'react'

const useToggle = (defaultValue: boolean): [boolean, () => void] => {
    const [val, toggleVal] = useState<boolean>(defaultValue)

    return [val, () => void toggleVal((prevState) => !prevState)]
}

export default useToggle
