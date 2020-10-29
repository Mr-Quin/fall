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
/*
    TODO: Refactor:
          Move default values to config
          Use config for particle systems
          Detect GPU to set particle count
          CPU Particle fallback
          Reduce imperative code
 */

/*
    TODO: Features:
          No repeated sound on bounce
          Background color change with time/sound
          Noise background?
          Step colors?
          Particle color change?
          Ambient sound
          Button to end game by making ground
 */
