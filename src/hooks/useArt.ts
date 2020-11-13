import { useEffect } from 'react'

const logArt = () => {
    console.info(
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
        `color: inherit;`,
        "background-color:black; color:white; padding:5px; font-family: 'Poiret One', Helvetica, Arial, sans-serif; font-size: 1.5em"
    )
    ;(window as any).logArt = logArt || {}
}

const useArt = () => {
    useEffect(() => {
        logArt()
    }, [])
}

export default useArt
