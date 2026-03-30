import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import "../css/login.css";
import Header from "../components/header";
import Footer from "../components/footer";
import img1 from "/public/images/logo-sps.png";
import img2 from "/public/images/logobk.png";

const Login = () => {

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleLogin = async (event) => {
        event.preventDefault();

        try {
            const response = await axios.post('http://localhost:5000/api/auth/login', {
                username,
                password
            });

            const { token, name, role } = response.data;

            localStorage.setItem("user", JSON.stringify({
                name,
                role
            }));

            localStorage.setItem("userToken", token);


            if (role === "ADMIN") {
                navigate("/");
            } else if (role === "PARKING_STAFF") {
                navigate("/");
            } else {
                navigate("/");
            }

        } catch (err) {
            console.error(err);
            alert("Sai tài khoản hoặc mật khẩu");
        }
    };

    const clearInput = () => {
        setUsername("");
        setPassword("");
    };

    return (
        <div className="login-page">
            <Header />

            <div className="login-wrapper">
                <div className="login-container">

                    <div className="logos">
                        <img src={img1} className="img" />
                        <img src={img2} className="img" />
                    </div>

                    <h2>Đăng nhập hệ thống</h2>

                    {/* ✅ FORM DUY NHẤT */}
                    <form className="form" onSubmit={handleLogin}>
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

                        <button type="submit">Login</button>
                        <button type="button" onClick={clearInput}>Clear</button>

                        <p>Change Password?</p>
                    </form>

                </div>
            </div>

            <Footer />
        </div>
    );
};

export default Login;