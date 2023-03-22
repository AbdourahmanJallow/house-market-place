import { useParams } from "react-router-dom"
import { useState, useEffect } from "react"
import{
    collection,
    getDocs,
    where,
    orderBy,
    limit,
    query,
    startAfter
} from 'firebase/firestore'
import { toast } from 'react-toastify'
import { db } from "../firebase.config"
import Spinner from "./Spinner"
import ListingItem from "./ListingItem"

function Category() {
    const [loading,setLoading] = useState(true)
    const [listingsData, setListingsData] = useState(null)
    const [lastFetchedListing, setLastFetchedListing] = useState(null)

    const params = useParams()

    useEffect(() => {
        const fetchListings = async () => {
            try {
                const listingsRef = collection(db, 'listings');
            
                /* Query Data */
                const q = query(
                    listingsRef,
                    where('type', '==', params.categoryName),
                    orderBy('timestamp', 'desc'),
                    limit(10));

                const querySnap = await getDocs(q);

                const lastVisible = querySnap.docs[querySnap.docs.length - 1]
                setLastFetchedListing(lastVisible)
                const listings = []
                
                querySnap.forEach((doc) => {
                    return listings.push(({
                        id: doc.id,
                        data: doc.data(),
                    }))
                })

                setListingsData(listings);
                setLoading(false);
            } catch (error) {
                toast.error('Could not fetch listings')
            }
            
        }

        fetchListings()
    }, [params.categoryName])

    /* Pagination / Load More */
    const onFetchMoreListings = async () => {
        try {
            const listingsRef = collection(db, "listings");

            /* Query Data */
            const q = query(
                listingsRef,
                where("type", "==", params.categoryName),
                orderBy("timestamp", "desc"),
                startAfter(lastFetchedListing), 
                limit(10)
            );

            const querySnap = await getDocs(q);

            const lastVisible = querySnap.docs[querySnap.docs.length - 1];
            setLastFetchedListing(lastVisible);
            const listings = [];

            querySnap.forEach((doc) => {
                return listings.push({
                    id: doc.id,
                    data: doc.data()
                });
            });

            setListingsData((prevState) => [...prevState, ...listings]);
            setLoading(false);
        } catch (error) {
            toast.error("Could not fetch listings");
        }
    };
    return (
        <div className='category'>
            <header>
                <p className='pageHeader'>
                    Places for {params.categoryName === 'rent' ?  'rent' : 'sale'}
                </p>
            </header>

            {loading ? <Spinner /> : listingsData && listingsData.length > 0 ?
            <>
                <main>
                    <ul className="categoryListings">
                        {listingsData.map((listing) =>(
                            <ListingItem
                                listing={listing.data}
                                id={listing.id}
                                key={listing.id}
                            />
                        ))}
                    </ul>
                </main>
                
                <br />
                <br />
                    {lastFetchedListing && (
                        <p className="loadMore" onClick={onFetchMoreListings}>Load More</p>
                )}
            </> : <p>No Listings for {params.categoryName}</p>}
        </div>
    )
}

export default Category