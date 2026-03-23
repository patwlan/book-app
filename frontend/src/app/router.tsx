import { createBrowserRouter, Navigate, useParams } from 'react-router-dom';
import App from './App';
import { CurrentReadingPage } from '../features/current-reading/pages/CurrentReadingPage';
import { ProfilePage } from '../features/profile/pages/ProfilePage';
import { ProfilesPage } from '../features/profile/pages/ProfilesPage';
import { SettingsPage } from '../features/settings/pages/SettingsPage';

function LegacyProfileRedirect() {
  const { userId } = useParams();
  return <Navigate replace to={userId ? `/profiles/${userId}` : '/profiles'} />;
}

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
      {
        path: 'profiles',
        element: <ProfilesPage />,
      },
      {
        path: 'profiles/:userId',
        element: <ProfilePage />,
      },
      {
        path: 'profile',
        element: <LegacyProfileRedirect />,
      },
      {
        path: 'profile/:userId',
        element: <LegacyProfileRedirect />,
      },
    ],
  },
]);

