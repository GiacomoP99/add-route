import routes from "./routes-const";
import { ReactNode } from "react";
import { Navigate } from "react-router-dom";

interface ProtectRouteProps {
  children: ReactNode;
  canNavigate: boolean;
}

const ProtectRoute = ({ canNavigate, children }: ProtectRouteProps) => {
  return (
    <>{canNavigate ? children : <Navigate replace to={routes.FORBIDDEN} />}</>
  );
};

export default ProtectRoute;
