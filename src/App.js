import { Routes, Route } from "react-router-dom";
import React from "react";

import Login from "./pages/auth/login";
import Register from "./pages/auth/register";
import Unauthorized from "./components/Unauthorized";

import AdminRoutes from "./routes/AdminRoutes";
import StaffRoutes from "./routes/StaffRoutes";
import UserRoutes from "./routes/UserRoutes";
import Homepage from "./pages/homepage";

function App() {
    return (
        <Routes>
            <Route path="/" element={<Homepage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/unauthorized" element={<Unauthorized/>} />

            <Route path="/admin/*" element={<AdminRoutes />} />
            <Route path="/staff/*" element={<StaffRoutes />} />
            <Route path="/*" element={<UserRoutes />} />
        </Routes>
    );
}

export default App