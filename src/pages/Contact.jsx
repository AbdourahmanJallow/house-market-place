import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase.config";
import { toast } from "react-toastify";

export default function Contact() {
    const [message, setMessage] = useState("");
    const [landlord, setLandLord] = useState(null);
    const [searchParams, setSearchParams] = useState();

    const params = useParams();
    useEffect(() => {
        const getLanlord = async () => {
            const docRef = doc(db, "users", params.landlordId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                setLandLord(docSnap);
            } else {
                toast.error("Could not get landlord data");
            }
        };

        getLanlord();
    }, [params.landlordId]);

    const onChange = (e) => setMessage(e.target.value);
    return (
        <div className="pageContainer">
            <header>
                <p className="pageHeader">Contact Landlord</p>
            </header>

            {landlord !== null && (
                <main>
                    <div className="contactLandLord">
                        <p className="landlordName">Contact {landlord?.name}</p>
                    </div>

                    <form className="messageForm">
                        <div className="messageDiv">
                            <label htmlFor="message" className="messageLabel">
                                Message
                            </label>
                            <textarea
                                name="message"
                                id="message"
                                className="textarea"
                                value={message}
                                onChange={onChange}
                            ></textarea>
                        </div>
                        <a
                            href={`mailto:${
                                landlord.email
                            }?Subject=${searchParams.get(
                                `listingName`
                            )}&body=${message}`}
                        >
                            <button type='button' className="primaryButton">
                                Send Message
                            </button>
                        </a>
                    </form>
                </main>
            )}
        </div>
    );
}
