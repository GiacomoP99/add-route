import Forbidden from "@pages/Forbidden";
import NotFound from "@pages/NotFound";
import React, { Suspense } from "react";
import { Route, Routes } from "react-router";

const AuthenticatedRoutes = React.lazy(() => import("./AuthenticatedRoutes"));

const AppRoutes = () => (
  <Suspense fallback={<div>Add suspense component ...</div>}>
    <Routes>
      <Route path="/forbidden" element={<Forbidden />} />
      <Route path="/404" element={<NotFound />} />
      <Route path="*" element={<AuthenticatedRoutes />} />
    </Routes>
  </Suspense>
);

export default AppRoutes;
