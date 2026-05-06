import Header from "../components/header"
import Footer from "../components/footer"
import React, { useState, useEffect } from "react";

import "./css/homepage.css";

function Homepage() {
    return (
        <div className="homepage">
            <Header />

            {/* HERO */}
            <section className="hero">
                <div className="hero-left">
                    <span className="badge">✨ Intelligent Parking Solution</span>

                    <h1>
                        Find Your Perfect <br />
                        Spot <span>Instantly</span>
                    </h1>

                    <p>
                        Smart real-time parking management system that connects
                        students, staff, and operators.
                    </p>

                    <div className="hero-buttons">
                        <button className="primary">Start Parking Smart →</button>
                        <button className="secondary">Watch Demo</button>
                    </div>

                    <div className="hero-stats">
                        <div><h3>10K+</h3><p>Users</p></div>
                        <div><h3>98%</h3><p>Satisfaction</p></div>
                        <div><h3>24/7</h3><p>Support</p></div>
                    </div>
                </div>

                <div className="hero-right">
                    <div className="parking-box">
                        <h4>Real-time Parking</h4>
                        <div className="grid">
                            {Array(9).fill(0).map((_, i) => (
                                <div key={i} className={i % 3 === 0 ? "slot red" : "slot green"}></div>
                            ))}
                        </div>
                        <h5>Occupied • Available</h5>
                    </div>
                </div>
            </section>

            {/* FEATURES */}
            <section className="features">
                <h2>Powerful Features for Every User</h2>
                <p>Manage parking efficiently with smart tools</p>

                <div className="feature-grid">
                    {[
                        "Real-time Availability",
                        "Seamless Payments",
                        "Smart Guidance",
                        "Analytics Dashboard",
                        "Security First",
                        "Multi-lot Support"
                    ].map((item, i) => (
                        <div key={i} className="feature-card">
                            <h3>{item}</h3>
                            <p>Lorem ipsum dolor sit amet</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* WHY */}
            <section className="why">
                <div className="why-left">
                    <h2>Why Choose SmartPark?</h2>

                    <ul>
                        <li>Save Time</li>
                        <li>Reduce Stress</li>
                        <li>Easy Payments</li>
                        <li>Better Data</li>
                    </ul>
                </div>

                <div className="why-right">
                    <div className="stat-box">
                        <h3>98%</h3>
                        <p>User Satisfaction</p>
                    </div>

                    <div className="stat-box">
                        <h3>45min</h3>
                        <p>Time Saved</p>
                    </div>
                </div>
            </section>

            {/* TESTIMONIAL */}
            <section className="testimonial">
                <h2>Loved by Users Everywhere</h2>

                <div className="testimonial-grid">
                    {["Sarah", "James", "Marcus", "Lisa"].map((name, i) => (
                        <div key={i} className="card">
                            <h4>{name}</h4>
                            <p>"SmartPark saved me so much time!"</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* FAQ */}
            <section className="faq">
                <h2>Frequently Asked Questions</h2>

                {[
                    "Can I reserve parking spots?",
                    "What if I can't find a spot?",
                    "How does analytics work?",
                    "Is support available?"
                ].map((q, i) => (
                    <div key={i} className="faq-item">{q}</div>
                ))}
            </section>

            {/* CTA */}
            <section className="cta">
                <h2>Ready to Simplify Parking?</h2>
                <p>Join thousands of users today</p>

                <div className="cta-button-container">
                    <button className="primary">Start Free Trial</button>
                    <button className="primary">Contact Sales</button>
                </div>
                
            </section>

            <Footer />
        </div>
    );
}

export default Homepage;