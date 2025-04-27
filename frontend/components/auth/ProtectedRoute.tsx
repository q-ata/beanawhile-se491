import React, { ReactNode, useContext } from "react";
import { Redirect, Route } from "react-router-dom";
import AuthContext from "../../contexts/AuthContext";

const ProtectedRoute = ({
  children,
  ...rest
}: {
  children: React.ReactNode;
  [rest: string]: any;
}) => {
  const { isAuthenticated } = useContext(AuthContext);

  return (
    <Route
      {...rest}
      render={() => {
        return isAuthenticated === true ? children : <Redirect to="/signin" />;
      }}
    />
  );
};

export default ProtectedRoute;
