import React, { useContext, useEffect, useState } from "react";
import { Data } from "./context/Context";
import LoginError from "./pages/error/LoginError";
import {
  BrowserRouter as Router,
  Route,
  Switch,
  useHistory,
} from "react-router-dom";
import Home from "./pages/home/Home";
import Login from "./pages/login/Login";
import Register from "./pages/register/Register";
import Tasks from "./pages/tasks/Tasks";
import Project from "./pages/project/Project";
import Loading from "./components/Loading/Loading";
import "./App.css";
import { app } from "./firebase/firebase";
import Error from "./pages/error/Error";
function App() {
  const [update, setUpdate] = useState(null);
  const {
    user,
    loading,
    error,
    canEnter,
    getAllProjectDetails,
    getUserInformation,
  } = useContext(Data);
  useEffect(async () => {
    if (user) {
      setUpdate("");
      await getUserInformation();
      await getAllProjectDetails();
    }
  }, [user]);
  if (loading) {
    return <Loading />;
  }
  if (!user) {
    return (
      <Router>
        <Switch>
          <Route exact path="/" component={Login} />
          <Route exact path="/register" component={Register} />
          <Route component={LoginError} />
        </Switch>
      </Router>
    );
  }
  if (user && !canEnter) {
    return <Loading />;
  }
  if (user && canEnter) {
    return (
      <Router>
        {/* <button
          onClick={() => {
            app.auth().signOut();
          }}
        >
          Logout
        </button> */}
        <Switch>
          <Route exact path="/" component={Home} />
          <Route exact path="/project/:id" component={Project} />
          <Route exact path="/tasks/:id" component={Tasks} />
          <Route component={Error} />
        </Switch>
      </Router>
    );
  }
  if (error) {
    return <h1>Something went wrong</h1>;
  }
}

export default App;
