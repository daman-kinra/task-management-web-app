import React, { createContext, useState } from "react";
import { app } from "../firebase/firebase";
import { useAuthState } from "react-firebase-hooks/auth";

export const Data = createContext();

export function Context(props) {
  const [user, loading, error] = useAuthState(app.auth());
  const [canEnter, setCanEnter] = useState(false);
  const [allProjects, setAllProjects] = useState([]);
  const [userDetails, setUserDeatils] = useState({});
  const projectsRef = app.firestore().collection("projects");
  const usersRef = app.firestore().collection("users");

  const getUserInformation = () => {
    return new Promise((res, rej) => {
      try {
        usersRef.doc(user.email).onSnapshot((doc) => {
          setUserDeatils(doc.data());
          res("");
        });
      } catch (err) {
        console.log(err);
        rej(err);
      }
    });
  };
  const getAllProjectDetails = () => {
    return new Promise((res, rej) => {
      try {
        projectsRef
          .where("team", "array-contains", user.email)
          .orderBy("name")
          .onSnapshot((doc) => {
            const arr = [];
            doc.forEach((item) => {
              arr.push({ ...item.data() });
            });
            setAllProjects(arr);
            setCanEnter(true);
            res("");
          });
      } catch (err) {
        console.log(err);
        rej(err);
      }
    });
  };
  return (
    <Data.Provider
      value={{
        user,
        loading,
        error,
        canEnter,
        getAllProjectDetails,
        allProjects,
        userDetails,
        getUserInformation,
        projectsRef,
        usersRef,
      }}
    >
      {props.children}
    </Data.Provider>
  );
}
