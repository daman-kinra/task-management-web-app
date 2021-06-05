import React, { useState, useEffect, useContext } from "react";
import { app, provider, fieldValue } from "../../firebase/firebase";
import { Link } from "react-router-dom";
import swal from "sweetalert";
import Loading from "../../components/Loading/Loading";
import "./Register.css";
import Sidebar from "../../components/sidebar/Sidebar";
import { Data } from "../../context/Context";
function Register(props) {
  const { user } = useContext(Data);
  if (user) {
    props.history.push("/");
  }
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [errorFromFirebse, setErrorFromFirebse] = useState("");
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [cnfrm__password, setCnfrm__password] = useState("");
  const ref = app.firestore().collection("admin-access-request");
  function validateEmail(email) {
    const re =
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  }
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
  const checkAndAdd = (email, data) => {
    return new Promise(async (resolve, reject) => {
      try {
        const docRef = ref.doc(email);
        const result = await app
          .firestore()
          .runTransaction(async (transaction) => {
            const doc = await transaction.get(docRef);
            if (doc.exists) {
              let err = {
                code: "AlreadyRegistered",
                message: "User is already registered.",
              };
              throw err;
            }
            transaction.set(docRef, data);
            return;
          });
        resolve(result);
      } catch (err) {
        reject(err);
      }
    });
  };
  const register = async (e) => {
    e.preventDefault();

    try {
      if (firstName === "") {
        setError("firstname");

        return;
      }
      if (lastName === "") {
        setError("lastname");

        return;
      }
      if (email === "") {
        setError("email");

        return;
      }
      if (!validateEmail(email.toLocaleLowerCase().trim())) {
        setError("invalid");

        return;
      }
      if (password === "") {
        setError("password");

        return;
      }
      if (cnfrm__password === "") {
        setError("cnfrmpassword");

        return;
      }
      if (cnfrm__password !== password) {
        setError("doesnt match password");

        return;
      }
      setLoading(true);
      const data = {
        firstName,
        lastName,
        email,
        password,
        cnfrm__password,
      };
      // await checkAndAdd(email, data)
      //   .then(() => {
      //     setLoading(false);
      //     setFirstName("");
      //     setLastName("");
      //     setEmail("");
      //     setErrorFromFirebse("");
      //     setCnfrm__password("");
      //     setPassword("");
      //     swal(
      //       "Request sent!",
      //       "We will mail you once your details get varified!",
      //       "success"
      //     );
      //   })
      //   .catch((err) => {
      //     setLoading(false);
      //     setErrorFromFirebse(err.code);
      //   });
      const result = await app
        .auth()
        .createUserWithEmailAndPassword(email, password);

      const user = await usersRef.doc(result.user.email).get();
      if (!user.exists) {
        await usersRef.doc(result.user.email).set({
          photoUrl: result.user.photoURL,
          name: `${firstName} ${lastName}`,
          email: result.user.email,
          projects: [],
          projectRequests: [],
          joined: fieldValue.serverTimestamp(),
          online: true,
        });
      }
      props.history.push("/");
    } catch (err) {
      setLoading(false);
      setErrorFromFirebse(err.code);
    }
  };
  useEffect(() => {
    const errorText = document.getElementById("scrollIntoView");
    if (errorText) {
      errorText.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [error, loading]);
  return (
    <>
      {loading ? (
        <Loading></Loading>
      ) : (
        <div className="login__main__container">
          <Sidebar />
          <div className="right__container">
            <div className="registration__box">
              <div className="header">
                <h2>Register Yourself</h2>
              </div>
              <form action="" className="registration__form">
                <div className="fullname">
                  <div className="firstName">
                    <label htmlFor="firstName">Firstname:</label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      className="input"
                      placeholder="Firstname"
                      value={firstName}
                      onChange={(e) => {
                        setFirstName(e.target.value);
                        setError("");
                      }}
                    />
                    {error === "firstname" ? (
                      <span className="error" id="scrollIntoView">
                        * Enter your firstname
                      </span>
                    ) : (
                      <span className="error"></span>
                    )}
                  </div>
                  <div className="lastName">
                    <label htmlFor="lastName">Lastname:</label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      className="input"
                      placeholder="Lastname"
                      value={lastName}
                      onChange={(e) => {
                        setLastName(e.target.value);
                        setError("");
                      }}
                    />
                    {error === "lastname" ? (
                      <span className="error" id="scrollIntoView">
                        * Enter your lastname
                      </span>
                    ) : (
                      <span className="error"></span>
                    )}
                  </div>
                </div>
                <div className="email">
                  <label htmlFor="email">E-mail ID:</label>
                  <input
                    type="text"
                    id="email"
                    name="email"
                    className="input"
                    placeholder="E-mail ID"
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
                </div>

                <div className="password">
                  <label htmlFor="password">Password:</label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    className="input"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError("");
                    }}
                  />
                  {error === "password" ? (
                    <span className="error" id="scrollIntoView">
                      * Enter your Password
                    </span>
                  ) : (
                    <span className="error"></span>
                  )}
                </div>
                <div className="cnfrm__password">
                  <label htmlFor="cnfrmpassword">Confirm Password:</label>
                  <input
                    type="password"
                    id="cnfrmpassword"
                    name="cnfrmpassword"
                    className="input"
                    placeholder="Confirm Password"
                    value={cnfrm__password}
                    onChange={(e) => {
                      setCnfrm__password(e.target.value);
                      setError("");
                    }}
                  />
                  {error === "cnfrmpassword" ? (
                    <span className="error" id="scrollIntoView">
                      * Password cannot be empty
                    </span>
                  ) : error === "doesnt match password" ? (
                    <span className="error">
                      * Password and Confirm Password did not match
                    </span>
                  ) : (
                    <span className="error"></span>
                  )}
                </div>
                {errorFromFirebse === "AlreadyRegistered" ? (
                  <span className="firebase__error" id="scrollIntoView">
                    * Already Requested
                  </span>
                ) : errorFromFirebse.length !== 0 ? (
                  <span className="firebase__error" id="scrollIntoView">
                    * Email / Password is Wrong
                  </span>
                ) : (
                  <span className="firebase__error"></span>
                )}
                <div className="logins">
                  <button className="login__btn" onClick={register}>
                    Register
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
                  <span>Already have an Account?</span>
                  <Link to="/">Login</Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Register;
