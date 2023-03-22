import { ReactComponent as SignInIcon } from '../assets/svg/keyboardArrowRightIcon.svg';
import { getAuth, updateProfile, createUserWithEmailAndPassword } from 'firebase/auth'
import visbilityIcon from '../assets/svg/visibilityIcon.svg'
import { Link, useNavigate } from 'react-router-dom'
import {setDoc, doc, serverTimestamp} from 'firebase/firestore'
import OAuth from '../components/OAuth';
import { db } from '../firebase.config'
import { useState } from 'react'
import { toast } from 'react-toastify';


export default function SignUp() {
    const [showPassword, setShowPassword] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: ''
    })

    const { name, email, password } = formData
    const navigate = useNavigate();

    const onChange = (e) => {
        setFormData((prevState) => ({
            ...prevState,
            [e.target.id]: e.target.value
        }))
    }
    
    const onSubmit = async (e) => {
        e.preventDefault();

        try {
            /* Register User */
            const auth = getAuth()
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user
            updateProfile(auth.currentUser, {
                displayName: name,
            })
            /* Make copy of data */
            const formDataCopy = { ...formData }
            delete formDataCopy.password
            formDataCopy.timestamp = serverTimestamp()

            /* Store User in Firestore Database */ 
            await setDoc(doc(db, 'users', user.uid),formDataCopy)
            navigate('/')
        } catch (error) {
            console.log(JSON.stringify(error, null, 2))
            toast.error('Something went wrong with registration');
        }
    }

    return (
        <>
            <div className="pageContainer">
                <header>
                    <p className="pageHeader">
                        Welcome Back!
                    </p>
                </header>

                <form onSubmit={onSubmit}>
                    <input
                        type="text"
                        placeholder='Name'
                        id='name'
                        value={name}
                        onChange={onChange}
                        className='nameInput'
                    />
                    <input
                        type="email"
                        placeholder='Email'
                        id='email'
                        value={email}
                        onChange={onChange}
                        className='emailInput'
                    />

                    <div className="passwordInputDiv">
                        <input type={showPassword ? 'text' : 'password'}
                            placeholder='Password'
                            className='passwordInput'
                            value={password}
                            onChange={onChange}
                            id='password'
                        />

                        <img src={visbilityIcon}
                            alt="show password"
                            className='showPassword'
                            onClick={() => setShowPassword(prevState => !prevState)}
                        />
                            
                    </div>
                    <Link to='/forgot-password' className='forgotPasswordLink'>Forgot Password?</Link>

                    <div className="signUpBar">
                        <p className="signUpText">Sign Up</p>
                        <button className="signUpButton">
                            <SignInIcon width='34px' height='34px' fill="#fff"/>
                        </button>
                    </div>
                </form>

                {/* {Google OAuth} */}
                <OAuth />
                <Link to='/sign-in' className='registerLink'>Sign In Instead</Link>
            </div>
        </>
    )
}