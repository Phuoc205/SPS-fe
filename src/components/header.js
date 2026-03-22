import React from 'react'
import '../css/header.css'
import { Link } from "react-router-dom"
import logo from "/public/images/logo-sps.png";

const Header = () => {
    return (
        <div className='header-container'>
            <div className='header-logo-container'>
                <img src={logo} className='header-logo' />
            </div>

            <div className='header-menubar'>
                <Link className="header-menubar-item" to="/"><h3>Trang chủ</h3></Link>
                <Link className="header-menubar-item" to="/parkinglot"><h3>Bãi đỗ xe</h3></Link>
                <Link className="header-menubar-item" to="/ticketlookup"><h3>Tra cứu vé</h3></Link>
                <Link className="header-menubar-item" to="/parkinghistory"><h3>Lịch sử gửi xe</h3></Link>
                <Link className="header-menubar-item" to="/news"><h3>Tin tức</h3></Link>
            </div>

            <div className='header-login'>
                <Link to="/login"><h3>Đăng nhập</h3></Link>
            </div>
        </div>
    )
}

export default Header