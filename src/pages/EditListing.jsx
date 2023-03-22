import { useState, useEffect, useRef } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import {
    getStorage,
    ref,
    uploadBytesResumable,
    getDownloadURL
} from "firebase/storage";
import { v4 as uuidv4 } from "uuid";
import { useNavigate, useParams } from "react-router-dom";
import Spinner from "../components/Spinner.jsx";
import { toast } from "react-toastify";
import { db } from "../firebase.config.js";
import { doc, updateDoc, getDoc, serverTimestamp } from "firebase/firestore";

function EditListing() {

        // eslint-disable-next-line
    const [geolocationEnabled, setGeolocationEnabled] = useState(true);
    const [loading, setLoading] = useState(false);
    const [listing, setListing] = useState(null);
    const [formData, setFormData] = useState({
        type: "rent",
        name: "",
        bedrooms: 1,
        bathrooms: 1,
        parking: false,
        furnished: false,
        address: "",
        offer: false,
        regularPrice: 0,
        discountedPrice: 0,
        images: {},
        latitude: 0,
        longitude: 0
    });
    const auth = getAuth();
    const navigate = useNavigate();
    const isMounted = useRef(true);
    const params = useParams()

    const {
        type,
        name,
        bedrooms,
        bathrooms,
        parking,
        furnished,
        address,
        offer,
        regularPrice,
        discountedPrice,
        images,
        latitude,
        longitude
    } = formData;


    useEffect(() => {
        if (listing && listing.userRef !== auth.currentUser.uid) {
            toast.error("You can not edit that listing");
            navigate("/");
        }
    }, [auth.currentUser.uid, navigate,listing]);

    //Set Listing to edit
    useEffect(() => {
        // setLoading(true)
        const fetchListing = async () => {
            const docRef = doc(db, 'listings', params.listingId)
            const docSnap = await getDoc(docRef)
            if (docSnap.exists()) {
                setListing(docSnap.data())
                setFormData({
                    ...docSnap.data(),
                    address: docSnap.data().location
                });
                setLoading(false)
            } else {
                navigate('/')
                toast.error('Listing does not exist')
            }
        }

        fetchListing()
    }, [navigate, params.listingId])

    //Set userRef to logged in user
    useEffect(() => {
        if (isMounted) {
            onAuthStateChanged(auth, (user) => {
                if (user) {
                    setFormData({
                        ...formData,
                        userRef: user.uid
                    });
                } else {
                    navigate("/sign-in");
                }
            });
        }

        return () => {
            isMounted.current = false;
        };
        // eslint-disable-next-line
    }, [isMounted]);

    const onSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        if (discountedPrice >= regularPrice) {
            setLoading(false);
            toast.error("Discounted price should be less than regular price!");
            return;
        }

        if (images.length > 6) {
            setLoading(false);
            toast.error("Max 6 images");
            return;
        }

        let geolocation = {};
        let location;

        if (geolocationEnabled) {
            const response = await fetch(
                `https://api.openweathermap.org/geo/1.0/direct?q=${address}&limit=1&appid=${process.env.REACT_APP_GEOCODE_API_KEY}`
            );
            const data = await response.json();
            console.log(data);

            geolocation.lng = data[0]?.lat ?? 0; //Latitude
            geolocation.lat = data[0]?.lon ?? 0; //longitude
            location = data.length === 0 ? "undefined" : data[0].name;
            if (location === undefined || location.includes("undefined")) {
                setLoading(false);
                toast.error("Enter a valid address name");
                return;
            }
        } else {
            geolocation.lat = latitude;
            geolocation.lng = longitude;
            location = address;
            // setLoading(false);
        }
        console.log(geolocation, location);

        /* Store image */
        const storeImage = async (image) => {
            return new Promise((resolve, reject) => {
                const storage = getStorage();
                const fileName = `${auth.currentUser.uid}-${
                    image.name
                }-${uuidv4()}`;

                const storageRef = ref(storage, "images/" + fileName);
                const uploadTask = uploadBytesResumable(storageRef, image);

                uploadTask.on(
                    "state_changed",
                    (snapshot) => {
                        const progress =
                            (snapshot.bytesTransferred / snapshot.totalBytes) *
                            100;
                        console.log("Upload is " + progress + "% done");
                        switch (snapshot.state) {
                            case "paused":
                                console.log("Upload is paused");
                                break;
                            case "running":
                                console.log("Upload is running");
                                break;
                            default:
                                break;
                        }
                    },
                    (error) => {
                        // Handle unsuccessful uploads
                        reject(error);
                    },
                    () => {
                        // Handle successful uploads on complete
                        // For instance, get the download URL: https://firebasestorage.googleapis.com/...
                        getDownloadURL(uploadTask.snapshot.ref).then(
                            (downloadURL) => {
                                resolve(downloadURL);
                            }
                        );
                    }
                );
            });
        };

        const imageUrls = await Promise.all(
            [...images].map((image) => storeImage(image))
        ).catch(() => {
            setLoading(false);
            toast.error("Images could not be uploaded");
            return;
        });
        console.log(imageUrls);
        const formDataCopy = {
            ...formData,
            imageUrls,
            geolocation,
            timestamp: serverTimestamp()
        };
        formDataCopy.location = address;
        delete formDataCopy.images;
        delete formDataCopy.address;
        // location && (formDataCopy.location = location);
        !formDataCopy.offer && delete formDataCopy.discountedPrice;


        //Update Listing
        const docRef = doc(db, "listings", params.listingId);
        await updateDoc(docRef, formDataCopy)
        setLoading(false);
        toast.success("Listing  saved");
        navigate(`/category/${formDataCopy.type}/${docRef.id}`);
    };

    function onMutate(e) {
        let boolean = null;
        if (e.target.value === "true") {
            boolean = true;
        }
        if (e.target.value === "false") {
            boolean = false;
        }

        /* Files */
        if (e.target.files) {
            setFormData((prevState) => ({
                ...prevState,
                images: e.target.files
            }));
        }

        /* Numbers/texts/booleans */
        if (!e.target.files) {
            setFormData((prevState) => ({
                ...prevState,
                [e.target.id]: boolean ?? e.target.value
            }));
        }
    }

    if (loading) {
        return <Spinner />;
    }
    return (
        <div className="profile">
            <header>
                <p className="pageHeader">Edit Listing</p>
            </header>

            <main>
                <form onSubmit={onSubmit}>
                    <label className="formLabel">Rent / Sell</label>
                    <div className="formButtons">
                        <button
                            type="submit"
                            className={
                                type === "sale"
                                    ? "formButtonActive"
                                    : "formButton"
                            }
                            id="type"
                            value="sale"
                            onClick={onMutate}
                        >
                            Sell
                        </button>
                        <button
                            type="submit"
                            className={
                                type === "rent"
                                    ? "formButtonActive"
                                    : "formButton"
                            }
                            id="type"
                            value="rent"
                            onClick={onMutate}
                        >
                            Rent
                        </button>
                    </div>
                    <label className="formLabel">Name</label>
                    <input
                        type="text"
                        className="formInputName"
                        id="name"
                        value={name}
                        onChange={onMutate}
                        maxLength="32"
                        minLength="10"
                        required
                    />

                    <div className="formRooms flex">
                        <div>
                            <label className="formLabel">Bedrooms</label>
                            <input
                                type="number"
                                className="formInputSmall"
                                id="bedrooms"
                                value={bedrooms}
                                onChange={onMutate}
                                max="50"
                                min="1"
                                required
                            />
                        </div>
                        <div>
                            <label className="formLabel">Bathrooms</label>
                            <input
                                type="number"
                                className="formInputSmall"
                                id="bathrooms"
                                value={bathrooms}
                                onChange={onMutate}
                                max="50"
                                min="1"
                                required
                            />
                        </div>
                    </div>

                    <label className="formLabel">Parking spot</label>
                    <div className="formButtons">
                        <button
                            type="button"
                            className={
                                parking ? "formButtonActive" : "formButton"
                            }
                            id="parking"
                            value={true}
                            onClick={onMutate}
                            max="50"
                            min="1"
                        >
                            Yes
                        </button>

                        <button
                            type="button"
                            className={
                                !parking && parking !== null
                                    ? "formButtonActive"
                                    : "formButton"
                            }
                            id="parking"
                            value={false}
                            onClick={onMutate}
                            max="50"
                            min="1"
                        >
                            No
                        </button>
                    </div>
                    <label className="formLabel">Furnished</label>
                    <div className="formButtons">
                        <button
                            className={
                                furnished ? "formButtonActive" : "formButton"
                            }
                            type="button"
                            id="furnished"
                            value={true}
                            onClick={onMutate}
                        >
                            Yes
                        </button>
                        <button
                            className={
                                !furnished && furnished !== null
                                    ? "formButtonActive"
                                    : "formButton"
                            }
                            type="button"
                            id="furnished"
                            value={false}
                            onClick={onMutate}
                        >
                            No
                        </button>
                    </div>

                    <label className="formLabel">Address</label>
                    <textarea
                        className="formInputAddress"
                        type="text"
                        id="address"
                        value={address}
                        onChange={onMutate}
                        required
                    />
                    {!geolocationEnabled && (
                        <div className="formLatLng flex">
                            <div>
                                <label className="formLabel">Latitude</label>
                                <input
                                    className="formInputSmall"
                                    type="number"
                                    id="latitude"
                                    value={latitude}
                                    onChange={onMutate}
                                    required
                                />
                            </div>
                            <div>
                                <label className="formLabel">Longitude</label>
                                <input
                                    className="formInputSmall"
                                    type="number"
                                    id="longitude"
                                    value={longitude}
                                    onChange={onMutate}
                                    required
                                />
                            </div>
                        </div>
                    )}

                    <label className="formLabel">Offer</label>
                    <div className="formButtons">
                        <button
                            className={
                                offer ? "formButtonActive" : "formButton"
                            }
                            type="button"
                            id="offer"
                            value={true}
                            onClick={onMutate}
                        >
                            Yes
                        </button>
                        <button
                            className={
                                !offer && offer !== null
                                    ? "formButtonActive"
                                    : "formButton"
                            }
                            type="button"
                            id="offer"
                            value={false}
                            onClick={onMutate}
                        >
                            No
                        </button>
                    </div>

                    <label className="formLabel">Regular Price</label>
                    <div className="formPriceDiv">
                        <input
                            className="formInputSmall"
                            type="number"
                            id="regularPrice"
                            value={regularPrice}
                            onChange={onMutate}
                            min="50"
                            max="750000000"
                            required
                        />
                        {type === "rent" && (
                            <p className="formPriceText">$ / Month</p>
                        )}
                    </div>

                    {offer && (
                        <>
                            <label className="formLabel">
                                Discounted Price
                            </label>
                            <input
                                className="formInputSmall"
                                type="number"
                                id="discountedPrice"
                                value={discountedPrice}
                                onChange={onMutate}
                                min="50"
                                max="750000000"
                                required={offer}
                            />
                        </>
                    )}

                    <label className="formLabel">Images</label>
                    <p className="imagesInfo">
                        The first image will be the cover (max 6).
                    </p>
                    <input
                        className="formInputFile"
                        type="file"
                        id="images"
                        onChange={onMutate}
                        max="6"
                        accept=".jpg,.png,.jpeg"
                        multiple
                        required
                    />
                    <button
                        type="submit"
                        className="primaryButton editListingButton"
                    >
                        Edit Listing
                    </button>
                </form>
            </main>
        </div>
    );
}

export default EditListing;
