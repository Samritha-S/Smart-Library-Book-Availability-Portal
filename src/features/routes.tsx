import type { RouteObject } from 'react-router-dom';
import { MyBooksView } from './MyBooksView';
import { PlaceHoldButton, type PlaceHoldButtonProps } from './holds/PlaceHoldButton';
import { NotificationBell, type NotificationBellProps } from './notifications/NotificationBell';

export { MyBooksView, PlaceHoldButton, NotificationBell };
export type { PlaceHoldButtonProps, NotificationBellProps };

/**
 * Route objects exported for student layout consumption.
 * The router owner can import `studentFeatureRoutes` or `MyBooksView` directly.
 */
export const studentFeatureRoutes: RouteObject[] = [
  {
    path: 'my-books',
    element: <MyBooksView />,
  },
  {
    path: 'student/my-books',
    element: <MyBooksView />,
  },
];

export default MyBooksView;
