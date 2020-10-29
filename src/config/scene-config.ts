export const logArt = () => {
    console.log(
        `%c
                    *****/     .-._.---'  /\\         .-.        .-. 
         ,       *******//     (_) /   _  / |        / (_)      / (_)
        ,,,,,/*********//         /--.(  /  |  .    /          /       
        ,,,,,,,,,,,,,*//         /     \`/.__|_.'   /          /        
      ,,,,,,,,,,,,,,*///      .-/  .:' /    |   .-/.    .-..-/.    .-.
  ,,,,,,,,,,,,,,,,,*///      (_/  (__.'     \`-'(_/ \`-._.  (_/ \`-._.
      ,,,,,,,,,,,,,,//        
        ,,,,,,,,,,,,,,        
         ,,,,                
          ,,                
               %cPowered by React.js and Babylon.js`,
        `color: ${defaults.starColor};`,
        "background-color:black; padding:5px; font-family: 'Poiret One', cursive; font-size: 1.5em"
    )
    ;(window as any).logArt = logArt || {}
}

export const sceneConfig = {}
