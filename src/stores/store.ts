import create from 'zustand'

type StoreState = {
    bears: number
    ready: boolean
    actions: {
        setReady: (promises: Promise<any>[]) => void
    }
}

const useStore = create<StoreState>((set, get) => ({
    bears: 0,
    ready: false,
    actions: {
        setReady: (promises) => {
            Promise.all(promises)
                .then(() => set((state) => ({ ready: true })))
                .catch((err) => console.error(err))
        },
        increasePopulation: () => set((state) => ({ bears: state.bears + 1 })),
        removeAllBears: () => set({ bears: 0 }),
    },
}))

export default useStore
