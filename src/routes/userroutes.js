import React from "react";
import { Routes, Route } from "react-router-dom";

import ProtectedRoute from "../components/ProtectedRoute";
import HomePage from "../pages/homepage";
import ParkingAction from "../pages/main/parkingaction";
import ParkingHistory from "../pages/main/parkinghistory";

const UserRoutes = () => {
    return (
        
        <Routes>
            <Route
                path="/"
                element={
                    <ProtectedRoute allowedRoles={["USER"]}>
                        <HomePage />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/action"
                element={
                    <ProtectedRoute allowedRoles={["STAFF"]}>
                        <ParkingAction />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/history"
                element={
                    <ProtectedRoute allowedRoles={["STAFF"]}>
                        <ParkingHistory />
                    </ProtectedRoute>
                }
            />
            
        </Routes>
    );
};

export default UserRoutes;