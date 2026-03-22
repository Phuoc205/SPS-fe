import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import "../css/login.css";
import Header from "../components/header";
import Footer from "../components/footer";
import img1 from "/public/images/logo-sps.png"
import img2 from "/public/images/logobk.png"

function AdminLogin({ username, password, setUsername, setPassword, handleLogin, clearInput }) {
    return (
        <div className="form">
            <input 
                placeholder="Username" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)}
            />
            <input 
                type="password" 
                placeholder="Password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            <button onClick={handleLogin}>Login</button>
            <button onClick={clearInput}>Clear</button>
            <p>Change Password?</p>
        </div>
    );
}
const Login = () => {

    const [type, setType] = useState(null); // "user" | "admin"
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const navigate = useNavigate();

    const handleLogin = async (event) => {
        event.preventDefault();
        try {
            const response = await axios.post('http://localhost:5000/api/login', {
                username,
                password,
            });

            const { token } = response.data; 

            localStorage.setItem('userToken', token);

            navigate('/');
        } catch(err) {
            console.error(err);
        }
    }

    const clearInput = () => {
        setUsername("")
        setPassword("")
    }

    return (
        <div className="login-page">
            <Header />

            <div className="login-wrapper">
                <div className="login-container">

                    <div className="logos">
                        <img src={img1} className="img" />
                        <img src={img2} className="img" />
                    </div>

                    <h3>Log in using your account on:</h3>

                    <div className="login-option">
                        <button
                            className="login-button"
                            onClick={() => setType("admin")}
                        >
                            Admin
                        </button>

                        <button
                            className="login-button"
                            onClick={() => setType("otheruser")}
                        >
                            Người dùng khác
                        </button>
                    </div>

                    {/* 👇 render khi click */}
                    <div className="login-form">
                        {type === "admin" && <AdminLogin 
                            username={username}
                            password={password}
                            setUsername={setUsername}
                            setPassword={setPassword}
                            handleLogin={handleLogin}
                            clearInput={clearInput}
                        />}
                        {type === "otheruser" && navigate('/')}
                    </div>

                </div>
            </div>

            <Footer />
        </div>
    );
};

export default Login;