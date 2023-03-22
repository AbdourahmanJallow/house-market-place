import { useLocation, useNavigate } from 'react-router-dom'
import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth'
import { doc, setDoc, getDoc, serverTimestamp  } from 'firebase/firestore'
import { db } from '../firebase.config'
import {toast} from 'react-toastify'
import googleIcon from '../assets/svg/googleIcon.svg'

export default function OAuth() {
    const navigate = useNavigate()
    const location = useLocation()

    const onGoogleClick = async () => {
        try {
            const auth = getAuth()
            const provider = new GoogleAuthProvider()
            const result = signInWithPopup(auth, provider);
            const user = (await result).user;

            //Check for User
            const docRef = doc(db, 'users', user.uid);
            const docSnap = await getDoc(docRef);

            //If user doesn't exist, create user
            if (!docSnap.exists()) {
                setDoc(doc(db, 'users', user.uid), {
                    name: user.displayName,
                    email: user.email,
                    timestamp: serverTimestamp() 
                })
                navigate('/')
            }
        } catch (error) {
            toast.error('Could not authorize with Google')
        }
    }

    return (
        <div className='socialLogin'>
            <p>Sign {location.pathname === '/sign-in' ? 'In ' : 'Up '} 
                with
            </p>
            <button className='socialIconDiv' onClick={onGoogleClick}>
                <img className='socialIconImg' src={googleIcon} alt="google icon" width/>
            </button>
        </div>
    )
}
