import { createBrowserRouter } from 'react-router-dom';
import App from './App';
import { CurrentReadingPage } from '../features/current-reading/pages/CurrentReadingPage';
import { SettingsPage } from '../features/settings/pages/SettingsPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <CurrentReadingPage />,
      },
      {
        path: 'settings',
        element: <SettingsPage />,
      },
    ],
  },
]);

