import { Navigate, useLocation } from 'react-router-dom';
import { Spinner } from './ui/primitives';
import { useSelector } from 'react-redux';
import { useGetMeQuery } from '../features/auth/authApi';
import { selectCurrentUser, selectToken } from '../features/auth/authSlice';


export default function ProtectedRoute({ children, roles }) {
  const user = useSelector(selectCurrentUser);
const token = useSelector(selectToken);

const { isLoading } = useGetMeQuery(undefined, {
  skip: !token,
});
  const location = useLocation();

  if (token && !user && isLoading)  {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner className="h-7 w-7" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles && !roles.includes(user.role)) {
    // Authenticated but wrong role → send to their own dashboard
    return <Navigate to="/app" replace />;
  }

  return children;
}
