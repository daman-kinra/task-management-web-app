import React, { useState, useEffect } from "react";
import { app, provider, fieldValue } from "../../firebase/firebase";
import "./login.css";
import { Link } from "react-router-dom";
import Sidebar from "../../components/sidebar/Sidebar";
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
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [errorFromFirebse, setErrorFromFirebse] = useState("");
  function validateEmail(email) {
    const re =
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  }
  const login = (e) => {
    e.preventDefault();
    if (email === "") {
      setError("email");
      return;
    }
    if (!validateEmail(email.toLowerCase().trim())) {
      setError("invalid");

      return;
    }
    if (password === "") {
      setError("password");

      return;
    }
    setLoading(true);
    app
      .auth()
      .signInWithEmailAndPassword(email, password)
      .then(() => {
        setLoading(false);
      })
      .catch((err) => {
        setErrorFromFirebse(err.code);
        setLoading(false);
      });
  };
  useEffect(() => {
    const errorText = document.getElementById("scrollIntoView");
    if (errorText) {
      errorText.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [error, loading]);
  return (
    <div className="login__main__container">
      <Sidebar />
      <div className="right__container">
        <div className="login__box">
          <div className="header login__header">{/* <h2>Login</h2> */}</div>
          <form action="">
            <label htmlFor="email">E-mail ID:</label>
            <input
              type="text"
              className="input"
              placeholder="E-mail ID"
              id="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
              }}
            />
            {error === "email" || error === "invalid" ? (
              <span className="error" id="scrollIntoView">
                * Invalid Email
              </span>
            ) : (
              <span className="error"></span>
            )}

            <label htmlFor="pass">Password:</label>
            <input
              type="password"
              className="input"
              placeholder="Password"
              id="pass"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
            />
            {error === "password" ? (
              <span className="error" id="scrollIntoView">
                * Password cannot be empty
              </span>
            ) : (
              <span className="error"></span>
            )}
            {errorFromFirebse === "auth/user-not-found" ? (
              <span className="firebase__error" id="scrollIntoView">
                * User not Registered
              </span>
            ) : errorFromFirebse.length !== 0 ? (
              <span className="firebase__error" id="scrollIntoView">
                * Email / Password is Wrong
              </span>
            ) : (
              <span className="firebase__error"></span>
            )}
            <div className="logins">
              <button className="login__btn" onClick={login}>
                Login
              </button>
              <div className="or">
                <p>or</p>
              </div>
              <div className="google__login" onClick={loginWithGoogle}>
                <svg
                  version="1.1"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 48 48"
                  className="LgbsSe-Bz112c"
                >
                  <g>
                    <path
                      fill="#EA4335"
                      d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                    ></path>
                    <path
                      fill="#4285F4"
                      d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                    ></path>
                    <path
                      fill="#FBBC05"
                      d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                    ></path>
                    <path
                      fill="#34A853"
                      d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                    ></path>
                    <path fill="none" d="M0 0h48v48H0z"></path>
                  </g>
                </svg>
              </div>
            </div>
            <div className="not__registered">
              <span>Don't have an Account?</span>
              <Link to="/register">Register</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
