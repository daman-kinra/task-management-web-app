import React, { useContext, useState } from "react";
import { Data } from "../../context/Context";
import { app, fieldValue } from "../../firebase/firebase";
import { Link } from "react-router-dom";
import { CgAddR } from "react-icons/cg";
import { RiAddFill } from "react-icons/ri";
import { FaRegBell } from "react-icons/fa";
import { GrClose } from "react-icons/gr";
import { FcCheckmark } from "react-icons/fc";
import { GiHamburgerMenu } from "react-icons/gi";
import user from "../../images/user.png";
import "./home.css";
import swal from "sweetalert";

function Home(props) {
  const { allProjects, userDetails, projectsRef, usersRef } = useContext(Data);
  const [newProject, setNewProject] = useState("");
  const [show, setShowNotification] = useState(false);
  const [mobile, setMobile] = useState(false);
  const createNewProject = async () => {
    if (!newProject) swal("", "Enter a valid project name", "error");
    const name = newProject;
    try {
      setNewProject("");
      const str = "abcdefghijklmnopqrst";
      const projectId = `project-${Math.floor(
        Math.random() * 100000
      )}-${str.substring(
        Math.floor(Math.random() * 15),
        Math.floor(Math.random() * 15)
      )}-${Math.floor(Math.random() * 100000)}`;
      await projectsRef.doc(projectId).set({
        completedTasks: 0,
        totalTasks: 0,
        id: projectId,
        name: name,
        owner: userDetails.email,
        team: [userDetails.email],
        requestedUsers: [],
        startedAt: fieldValue.serverTimestamp(),
      });
      await usersRef
        .doc(userDetails.email)
        .update({ projects: [...userDetails.projects, projectId] });
    } catch (err) {
      console.log(err);
      setNewProject(name);
    }
  };

  const acceptProjectInvite = async (projectId) => {
    try {
      const newProjectRequestsArray = userDetails.projectRequests.filter(
        (item) => item.id !== projectId
      );
      await usersRef.doc(userDetails.email).update({
        projects: [...userDetails.projects, projectId],
        projectRequests: newProjectRequestsArray,
      });
      const doc = await projectsRef.doc(projectId).get();
      if (!doc.exists) throw { code: "doc does not exists" };
      const requestedUsers = doc
        .data()
        .requestedUsers.filter((item) => item !== userDetails.email);
      const team = [...doc.data().team, userDetails.email];

      projectsRef.doc(projectId).update({
        requestedUsers: requestedUsers,
        team: team,
      });
    } catch (err) {
      console.log(err);
    }
  };
  const rejectProjectInvite = async (projectId) => {
    try {
      const doc = await projectsRef.doc(projectId).get();
      if (!doc.exists) throw { code: "doc does not exists" };
      const newRequestsArray = doc
        .data()
        .requestedUsers.filter((item) => item !== userDetails.email);
      await projectsRef
        .doc(projectId)
        .update({ requestedUsers: newRequestsArray });
      const newProjectRequestsArray = userDetails.projectRequests.filter(
        (item) => item.id !== projectId
      );
      await usersRef
        .doc(userDetails.email)
        .update({ projectRequests: newProjectRequestsArray });
    } catch (err) {
      console.log(err);
    }
  };
  return (
    <div className="home">
      <div className={`left__container ${mobile ? "yes" : ""}`}>
        <GrClose
          className="cross-mobile"
          size="2rem"
          onClick={() => {
            setMobile(false);
          }}
        />
        <div className="create">
          <div className="custom">
            <input
              type="text"
              value={newProject}
              placeholder="NEW PROJECT"
              onChange={(e) => {
                setNewProject(e.target.value);
              }}
            />
            <span></span>
          </div>
          <div className="button">
            <CgAddR
              size="3rem"
              color="#866118"
              onClick={createNewProject}
              style={{ cursor: "pointer" }}
              className="add"
            />
          </div>
        </div>
        <div className="profile">
          <div className="image">
            <img
              src={userDetails.photoUrl ? userDetails.photoUrl : user}
              alt=""
              className="profile__img"
            />
            <input type="file" id="file" />
            <label htmlFor="file">
              <div className="updatephoto">
                <RiAddFill size="80%" color="#000" />
              </div>
            </label>
          </div>
          <h2>{userDetails.name}</h2>
        </div>
        <div className="joined">
          <div className="emailbox">
            <h2>Email:</h2>
            <h2>{userDetails.email}</h2>
          </div>
          <div className="join">
            <h2>Joined On: </h2>
            <h2>
              {new Date(
                userDetails.joined?.seconds * 1000
              ).toLocaleDateString()}
            </h2>
          </div>
        </div>
        <div className="footer">
          <p>BY XCLS00</p>
        </div>
      </div>
      <div className="right__container">
        <div className="headerhome">
          <div className="burger">
            <GiHamburgerMenu
              size="2rem"
              onClick={() => {
                setMobile(true);
              }}
            />
          </div>
          <div className="requests">
            <div
              className="bell"
              // onMouseEnter={() => {
              //   setShowNotification(true);
              // }}
            >
              {!show ? (
                <>
                  <FaRegBell
                    size="2rem"
                    onClick={() => {
                      setShowNotification(true);
                    }}
                  />
                  <p
                    onClick={() => {
                      setShowNotification(true);
                    }}
                  >
                    {userDetails.projectRequests.length}
                  </p>
                </>
              ) : (
                <GrClose
                  size="2rem"
                  onClick={() => {
                    setShowNotification(false);
                  }}
                />
              )}
            </div>
            <div
              className={`list ${show ? "show" : ""}`}
              // onMouseLeave={() => {
              //   setShowNotification(false);
              // }}
            >
              {userDetails.projectRequests.length === 0 ? (
                <div className="singleRequest">No Requests</div>
              ) : (
                userDetails.projectRequests.map((item) => {
                  return (
                    <div className="singleRequest">
                      <p>{item.name}</p>
                      <p>{item.owner}</p>
                      <div className="options-buttons">
                        <div className="cross">
                          <GrClose
                            color="red"
                            onClick={() => {
                              rejectProjectInvite(item.id);
                            }}
                          />
                        </div>
                        <div className="accept">
                          <FcCheckmark
                            onClick={() => {
                              acceptProjectInvite(item.id);
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
          <button
            className="login__btn"
            onClick={() => {
              app.auth().signOut();
            }}
          >
            {" "}
            Logout
          </button>
        </div>
        <div className="allprojects">
          {allProjects.map((item) => {
            return (
              <Link key={item.id} to={`/project/${item.id}`} className="links">
                <div className="singleProject">
                  <h3>{item.name}</h3>
                  <div className="owner">
                    <h3>Owner:</h3>
                    <h3>{item.owner}</h3>
                  </div>
                  <div className="task__deatils">
                    <h3>Total : {item.totalTasks}</h3>
                    <h3>Completed : {item.completedTasks} </h3>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Home;
