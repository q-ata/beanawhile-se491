import React, { useEffect, useState } from "react";
import { BrowserRouter, Redirect, Route, Switch } from "react-router-dom";
import SignInPage from "./pages/SignInPage";
import SignUpPage from "./pages/SignUpPage";
import HomePage from "./pages/HomePage";
import MyTravelPage from "./pages/MyTravelPage";
import PublicUserPage from "./pages/PublicUserPage";
import FriendsTravelPage from "./pages/FriendsTravelPage";
import FriendsPage from "./pages/FriendsPage";
import Settings from "./pages/Settings";
import AuthContext from "./contexts/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import {
  signup as signupRequest,
  login as signinRequest,
  logout as signoutRequest,
  getUser as getUserRequest,
} from "./utils/client";

const App = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    getUserRequest()
      .then((res) => {
        setIsAuthenticated(res.ok);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const signup = async (name: string, email: string, password: string) => {
    const res = await signupRequest(name, email, password);
    return res;
  };

  const signin = async (email: string, password: string) => {
    const res = await signinRequest(email, password);
    setIsAuthenticated(res.ok);
    return res;
  };

  const signout = async () => {
    await signoutRequest();
    setIsAuthenticated(false);
  };

  if (isLoading) {
    return null;
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, signup, signin, signout }}>
      <BrowserRouter>
        <Switch>
          <Route path="/signin">
            <SignInPage />
          </Route>
          <Route path="/signup">
            <SignUpPage />
          </Route>
          <ProtectedRoute path="/home">
            <HomePage />
          </ProtectedRoute>
          <Route path="/user/:email">
            <PublicUserPage />
          </Route>
          <ProtectedRoute path="/my-travel">
            <MyTravelPage />
          </ProtectedRoute>
          <ProtectedRoute path="/friends-travel">
            <FriendsTravelPage />
          </ProtectedRoute>
          <ProtectedRoute path="/friends">
            <FriendsPage />
          </ProtectedRoute>
          <ProtectedRoute path="/settings">
            <Settings />
          </ProtectedRoute>
          <Redirect from="*" to="/signin" />
        </Switch>
      </BrowserRouter>
    </AuthContext.Provider>
  );
};

export default App;
