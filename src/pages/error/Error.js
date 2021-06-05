import React from "react";
import Loading from "../../components/Loading/Loading";
function Error(props) {
  if (props.history) props.history.push("/");
  return <Loading />;
}

export default Error;
