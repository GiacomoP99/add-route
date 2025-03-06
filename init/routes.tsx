import type { ReactNode } from 'react';
import React from 'react';

const Home = React.lazy(() => import('@pages/Home'));

export type Route = {
  path: string;
  policy?: string;
  children?: Route[];
  component: ReactNode;
  isIndex: boolean;
};

export const routes: Route[] = [
  {
    path: '/home',
    isIndex: true,
    component: <Home />
  }
  // DO NOT REMOVE
];
