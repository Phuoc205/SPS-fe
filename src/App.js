import React from "react";
import { Routes, Route } from "react-router-dom";

import Homepage from "./routes/homepage";
import ParkingLot from "./routes/parkinglot";
import ParkingHistory from "./routes/parkinghistory";
import TicketLookup from "./routes/ticketlookup";
import Dashboard from "./routes/dashboard"
import UserManagement from "./routes/usermanagement"
import ParkingManagement from "./routes/parkingmanagement"
import Login from "./routes/login";
import './css/App.css'
function App() {
    return (
        <Routes>
            <Route path="/" element={<Homepage />} />
            <Route path="/parkinglot" element={<ParkingLot />} />
            <Route path="/parkinghistory" element={<ParkingHistory />} />
            <Route path="/ticketlookup" element={<TicketLookup />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/usermanagement" element={<UserManagement />} />
            <Route path="/parkingmanagement" element={<ParkingManagement />} />
            <Route path="/login" element={<Login />} />
        </Routes>
    );
}

export default App;