import { Route, Routes } from 'react-router-dom';
import '@fontsource-variable/inter';
import '@/styles/globals.css';
import { Layout } from '@/Layout';
import { notFoundRoute, routeDefs } from '@/routes';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        {routeDefs.map(({ path, Component }) => (
          <Route key={path} path={path} element={<Component />} />
        ))}
        <Route path="*" element={<notFoundRoute.Component />} />
      </Route>
    </Routes>
  );
}
