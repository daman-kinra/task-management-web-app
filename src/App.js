import React, { useContext, useEffect } from "react";
import { Data } from "./context/Context";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import Home from "./pages/home/Home";
import Login from "./pages/login/Login";
import Tasks from "./pages/tasks/Tasks";
import Project from "./pages/project/Project";
import "./App.css";
function App() {
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
      await getUserInformation();
      await getAllProjectDetails();
    }
  }, [user]);
  if (loading) {
    return <h1>loading...</h1>;
  }
  if (!user) {
    return <Login />;
  }
  if (user && !canEnter) {
    return <h1>loading...</h1>;
  }
  if (user && canEnter) {
    return (
      <Router>
        <Switch>
          <Route exact path="/" component={Home} />
          <Route exact path="/project/:id" component={Project} />
          <Route exact path="/tasks/:id" component={Tasks} />
        </Switch>
      </Router>
    );
  }
  if (error) {
    return <h1>Something went wrong</h1>;
  }
}

export default App;
