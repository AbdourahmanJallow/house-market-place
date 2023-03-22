import { useState } from 'react'
import {getAuth, sendPasswordResetEmail} from 'firebase/auth'
import { toast } from 'react-toastify'
import { ReactComponent as ArrowRightIcon } from '../assets/svg/keyboardArrowRightIcon.svg'
import { Link } from 'react-router-dom'

export default function ForgotPassword() {
    const [email, setEmail] = useState('')

    const onSubmit = async (e) => {
        e.preventDefault()
        try {
            const auth = getAuth()
            await sendPasswordResetEmail(auth, email);
            toast.success('Email sent succesfully')
        } catch (error) {
            toast.error('Could not send email.')
        }
    }
    
    const onChange = (e) => {
        setEmail(e.target.value)
    }

    return (
        <div className='pageContainer'>
            <header>
                <h2 className="pageHeader">Forgot Password</h2>
            </header>

            <main>
                <form onSubmit={onSubmit}>
                    <input
                        type="text"
                        placeholder='Email'
                        value={email}
                        onChange={onChange}
                        id='email'
                        className='emailInput'
                    />
                    <Link className='forgotPasswordLink' to='/sign-in'>Sign In</Link>
                    <div className="signInBar">
                        <div className="signInText">Send Reset Link</div>
                        <button className='signInButton' >
                            <ArrowRightIcon fill='#fff' width='34px' height='34px' />
                        </button>
                    </div>
                </form>
            </main>
        </div>
    )
}
