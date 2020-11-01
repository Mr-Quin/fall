import { useEffect, useState } from 'react'
import firebase from 'firebase/app'
import 'firebase/analytics'
import { firebaseConfig } from '../config/firebase-config'

const useFirebase = () => {
    const [firebaseApp, setFirebaseApp] = useState<firebase.app.App>()

    useEffect(() => {
        const app = firebase.initializeApp(firebaseConfig)
        firebase.analytics()
        setFirebaseApp(app)
    }, [])

    return firebaseApp
}

export default useFirebase
