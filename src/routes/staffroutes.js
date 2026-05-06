import React from "react";
import { Routes, Route } from "react-router-dom";

import ProtectedRoute from "../components/ProtectedRoute";
import TicketValidation from "../pages/staff/ticketvalidation";
import ManualGateControl from "../pages/staff/manualgatecontrol";

const StaffRoutes = () => {
    return (
        <Routes>
            <Route
                path="/"
                element={
                    <ProtectedRoute allowedRoles={["STAFF"]}>
                        <div>Staff Dashboard</div> {/* Thay bằng <StaffDashboard /> */}
                    </ProtectedRoute>
                }
            />

            <Route
                path="ticketvalidation"
                element={
                    <ProtectedRoute allowedRoles={["STAFF"]}>
                        <TicketValidation />
                    </ProtectedRoute>
                }
            />

            <Route
                path="manualgatecontrol"
                element={
                    <ProtectedRoute allowedRoles={["STAFF"]}>
                        <ManualGateControl />
                    </ProtectedRoute>
                }
            />
            
            {/* Các route staff khác thêm vào đây, VD: path="slotmanagement" */}
        </Routes>
    );
};

export default StaffRoutes;