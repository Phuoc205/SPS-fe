import React from "react";
import { Routes, Route } from "react-router-dom";

import ConfigPrice from "./routes/configprice";
import Homepage from "./routes/homepage";
import IOTManagement from "./routes/IOTmanagement"
import Login from "./routes/login";
import ManualGateControl from "./routes/manualgatecontrol"
import ParkingAction from "./routes/parkingaction"
import ParkingAvailability from "./routes/parkingavailability"
import ParkingHistory from "./routes/parkinghistory";
import ParkingLotManagement from "./routes/parkinglotmanagement"
import Payment from "./routes/payment"
import RevenueReport from "./routes/revenuereport"
import SlotManagement from "./routes/slotmanagement"
import SLotMonitor from "./routes/slotmonitor"
import TicketValidation from "./routes/ticketvalidation";
import UserManagement from "./routes/usermanagement"

import './css/App.css'
function App() {
    return (
        <Routes>
            <Route path="/" element={<Homepage />} />
            <Route path="/configprice" element={<ConfigPrice />} />
            <Route path="/IOTmanagement" element={<IOTManagement />} />
            <Route path="/login" element={<Login />} />
            <Route path="/manualgatecontrol" element={<ManualGateControl />} />
            <Route path="/parkingaction" element={<ParkingAction />} />
            <Route path="/parkingavailability" element={<ParkingAvailability />} />
            <Route path="/parkinghistory" element={<ParkingHistory />} />
            <Route path="/parkinglotmanagement" element={<ParkingLotManagement />} />
            <Route path="/payment" element={<Payment />} />
            <Route path="/revenuereport" element={<RevenueReport />} />
            <Route path="/slotmanagement" element={<SlotManagement />} />
            <Route path="/slotmonitor" element={<SLotMonitor />} />
            <Route path="/ticketvalidation" element={<TicketValidation />} />
            <Route path="/usermanagement" element={<UserManagement />} />
        </Routes>
    );
}

export default App;