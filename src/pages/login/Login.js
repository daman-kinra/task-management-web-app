import React from "react";
import { app, provider, fieldValue } from "../../firebase/firebase";
function Login() {
  const usersRef = app.firestore().collection("users");

  const loginWithGoogle = async (e) => {
    if (e) e.preventDefault();
    const result = await app.auth().signInWithPopup(provider);
    const user = await usersRef.doc(result.user.email).get();
    if (!user.exists) {
      await usersRef.doc(result.user.email).set({
        photoUrl: result.user.photoURL,
        name: result.user.displayName,
        email: result.user.email,
        projects: [],
        projectRequests: [],
        joined: fieldValue.serverTimestamp(),
        online: true,
      });
    }
  };
  return <button onClick={loginWithGoogle}>Login</button>;
}

export default Login;
