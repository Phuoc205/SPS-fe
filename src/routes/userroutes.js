import React from "react";
import { Route } from "react-router-dom";

import ProtectedRoute from "../components/ProtectedRoute";
import HomePage from "../pages/homepage";

const UserRoutes = () => {
    return (
        <ProtectedRoute allowedRoles={["USER", "ADMIN"]}>
            <HomePage />
        </ProtectedRoute>
    );
};

export default UserRoutes;