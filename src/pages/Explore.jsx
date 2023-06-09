import { Link } from "react-router-dom"
import rentCategoryImage from '../assets/jpg/rentCategoryImage.jpg'
import sellCategoryImage from '../assets/jpg/sellCategoryImage.jpg'
import Slider from "../components/Slider"

export default function Explore() {
    return (
        <div className="explore">
            <header>
                <h1 className="pageHeader">Explore</h1>
            </header>

            <main>
                <Slider />

                <p className="exploreCategoryHeading">Categories</p>
                <div className="exploreCategories">
                    <Link to='/category/rent'>
                        <img src={rentCategoryImage} alt="rent" className="exploreCategoryImg" />
                        <p className="exploreCategoryName">Places for rent</p>
                    </Link>

                    <Link to='/category/sale'>
                        <img src={sellCategoryImage} alt="sell" className="exploreCategoryImg" />
                        <p className="exploreCategoryName">Places for sale</p>
                    </Link>
                </div>
            </main>
        </div>
    )
}
