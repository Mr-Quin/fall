import { useEffect } from 'react'
import firebase from 'firebase/app'
import 'firebase/analytics'
import { firebaseConfig } from '../config/firebase-config'

const useFirebase = () => {
    useEffect(() => {
        firebase.initializeApp(firebaseConfig)
        firebase.analytics()
    }, [])
}

export default useFirebase
