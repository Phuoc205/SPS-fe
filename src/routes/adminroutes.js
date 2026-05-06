import React from "react";
import { Routes, Route } from "react-router-dom";

import ProtectedRoute from "../components/ProtectedRoute";
import AdminLayout from "../pages/management/AdminLayout";
import UserManagement from "../pages/management/usermanagement";
import ConfigPrice from "../pages/management/configprice";
import ParkingLotManagement from "../pages/management/parkinglotmanagement";
import IOTManagement from "../pages/management/IOTmanagement";
import SlotManagement from "../pages/management/slotmanagement";

const AdminRoutes = () => {
    return (
        <Routes>
            <Route
                path="/"
                element={
                    <ProtectedRoute allowedRoles={["ADMIN"]}>
                        <AdminLayout />
                    </ProtectedRoute>
                }
            >
                <Route index element={<div>Dashboard</div>} />
                <Route path="users" element={<UserManagement />} />
                <Route path="iot" element={<IOTManagement />} />
                <Route path="price" element={<ConfigPrice />} />
                <Route path="lot" element={<ParkingLotManagement />} />
                <Route path="slot" element={<SlotManagement />} />
            </Route>
        </Routes>
    );
};

export default AdminRoutes;