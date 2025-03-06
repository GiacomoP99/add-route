import usePolicyStore from '@hooks/usePolicyStore';
import ProtectRoute from '@routes/ProtectRoute';
import routes, { type Route } from './routes';

const mapRoute = (route: Route, policyStore: Record<string, boolean>) => {
  return route.policy ? (
    <Route
      index={route.isIndex}
      path={route.path}
      element={
        <ProtectRoute canNavigate={policyStore[route.policy]}>
          {route.component}
        </ProtectRoute>
      }
    >
      {route.children?.map(childRoute => mapRoute(childRoute, policyStore))}
    </Route>
  ) : (
    <Route index={route.isIndex} path={route.path} element={route.component}>
      {route.children?.map(childRoute => mapRoute(childRoute, policyStore))}
    </Route>
  );
};

const AuthenticatedRoutes = () => {
  const policyStore = usePolicyStore();
  return routes.map(route => mapRoute(route, policyStore));
};

export default AuthenticatedRoutes;
