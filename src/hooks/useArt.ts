import { useEffect } from 'react'
import { colors } from '../config/scene-config'

const logArt = () => {
    console.log(
        `%c
                    *****/     ########\\  ######\\  ##\\       ##\\       
         ,       *******//     ##  _____|##  __##\\ ## |      ## |      
        ,,,,,/*********//      ## |      ## /  ## |## |      ## |        
        ,,,,,,,,,,,,,*//       #####\\    ######## |## |      ## |           
      ,,,,,,,,,,,,,,*///       ##  __|   ##  __## |## |      ## |      
  ,,,,,,,,,,,,,,,,,*///        ## |      ## |  ## |## |      ## |      
      ,,,,,,,,,,,,,,//         ## |      ## |  ## |########\\ ########\\ 
        ,,,,,,,,,,,,,,         \\__|      \\__|  \\__|\\________|\\________|
         ,,,,                
          ,,                
               %cPowered by React.js and Babylon.js`,
        `color: ${colors.starColorSecondary};`,
        "background-color:black; padding:5px; font-family: 'Poiret One', cursive; font-size: 1.5em"
    )
    ;(window as any).logArt = logArt || {}
}

const useArt = () => {
    useEffect(() => {
        logArt()
    }, [])
}

export default useArt
