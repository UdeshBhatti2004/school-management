// COMPATIBILITY SHIM — migration in progress.
//
// The real auth state now lives in features/auth/authSlice.js and is read
// through RTK Query (features/auth/authApi.js). This file keeps the old
// `useAuth()` / `<AuthProvider>` API intact so pages that haven't been
// migrated to Redux yet don't need to change a single import.
//
// Once every page calls useSelector/useLoginMutation directly, delete this
// file along with the AuthProvider usage in App.jsx.
import { useDispatch, useSelector } from 'react-redux';
import { useLoginMutation, useGetMeQuery } from '../features/auth/authApi';
import { logout as logoutAction, updateUser as updateUserAction, selectCurrentUser, selectToken } from '../features/auth/authSlice';

export function AuthProvider({ children }) {
  // No-op now that <Provider store={store}> in main.jsx owns the state.
  // Kept so existing `<AuthProvider>` usage in App.jsx doesn't need edits.
  return children;
}

export function useAuth() {
  const dispatch = useDispatch();
  const user = useSelector(selectCurrentUser);
  const token = useSelector(selectToken);
  const [loginMutation] = useLoginMutation();

  // Resolves the session on first load (page refresh) when a token already
  // exists in storage but the user object hasn't been hydrated yet.
  const { isLoading: meLoading } = useGetMeQuery(undefined, { skip: !token });
  const loading = Boolean(token) && !user && meLoading;

  const login = async (email, password) => {
    const data = await loginMutation({ email, password }).unwrap();
    return data.user;
  };

  const logout = () => dispatch(logoutAction());
  const updateUser = (patch) => dispatch(updateUserAction(patch));

  return { user, loading, login, logout, updateUser };
}
