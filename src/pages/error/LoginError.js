import React from "react";
import Loading from "../../components/Loading/Loading";
function LoginError(props) {
  if (props.history) props.history.push("/");
  return <Loading />;
}

export default LoginError;
