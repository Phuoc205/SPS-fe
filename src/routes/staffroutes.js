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
                        <StaffLayout />
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
            
        </Routes>
    );
};

export default StaffRoutes;