import Header from "../components/header"
import Footer from "../components/footer"

import Banner from "../components/Banner";
import Features from "../components/Features";
import Stats from "../components/Stats";
import ParkingPreview from "../components/ParkingPreview";
import HowItWorks from "../components/HowItWorks";
import NewsPreview from "../components/NewsPreview";
import CTA from "../components/CTA";
import React, { useState, useEffect } from "react";

function Homepage() {    
    return (
        <div>
            <Header />

            <Banner />
            <Features />
            <Stats />
            <ParkingPreview />
            <HowItWorks />
            <NewsPreview />
            <CTA />

            <Footer />
        </div>
    )
}

export default Homepage