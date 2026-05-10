import React from "react";
import { Routes, Route } from "react-router-dom";

import ProtectedRoute from "../components/ProtectedRoute";
import TicketValidation from "../pages/staff/ticketvalidation";
import ManualGateControl from "../pages/staff/manualgatecontrol";
import StaffLayout from "../pages/staff/StaffLayout";
import SlotManagement from "../pages/management/slotmanagement";

const StaffRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<StaffLayout />}>
                <Route path="ticketvalidation" element={<TicketValidation />} />
                <Route path="manualgatecontrol" element={<ManualGateControl />} />
                <Route path="slot" element={<SlotManagement />} />
            </Route>
        </Routes>
    );
};

export default StaffRoutes;