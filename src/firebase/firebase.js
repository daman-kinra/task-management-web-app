import firebase from "firebase/app";
import "firebase/firestore";
import "firebase/auth";
import "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyC52wAw7Mz1IKLtxYnNwokrXx3Kdnqm1rk",
  authDomain: "project-management-web-app.firebaseapp.com",
  projectId: "project-management-web-app",
  storageBucket: "project-management-web-app.appspot.com",
  messagingSenderId: "652124393809",
  appId: "1:652124393809:web:8ef4c0739b140c94668370",
};

const app = firebase.initializeApp(firebaseConfig);
const provider = new firebase.auth.GoogleAuthProvider();
const fieldValue = firebase.firestore.FieldValue;

export { app, fieldValue, provider };
