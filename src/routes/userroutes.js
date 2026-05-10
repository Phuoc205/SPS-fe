import React from "react";
import { Routes, Route } from "react-router-dom";

import ProtectedRoute from "../components/ProtectedRoute";
import HomePage from "../pages/homepage";
import ParkingAction from "../pages/main/parkingaction";
import ParkingHistory from "../pages/main/parkinghistory";
import Payment from "../pages/payment"
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
                path="/parkingaction"
                element={
                    <ProtectedRoute allowedRoles={["USER"]}>
                        <ParkingAction />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/history"
                element={
                    <ProtectedRoute allowedRoles={["USER"]}>
                        <ParkingHistory />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/payment"
                element={
                    <ProtectedRoute allowedRoles={["USER"]}>
                        <Payment/>
                    </ProtectedRoute>
                }
            />
            
        </Routes>
    );
};

export default UserRoutes;