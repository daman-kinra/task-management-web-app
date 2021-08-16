import React, { useContext, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { CgAddR } from "react-icons/cg";
import { RiAddFill } from "react-icons/ri";
import { FaRegBell } from "react-icons/fa";
import { GrClose } from "react-icons/gr";
import { FcCheckmark } from "react-icons/fc";
import { GiHamburgerMenu } from "react-icons/gi";
import Loading from "../../components/Loading/Loading";
import { Data } from "../../context/Context";
import { app } from "../../firebase/firebase";
import { PieChart } from "react-minimal-pie-chart";
import { io } from "socket.io-client";
import "./project.css";
import axios from "axios";

const socket = io("http://localhost:5000");

function Project(props) {
  const [newUserEmail, setNewUser] = useState("");
  const { projectsRef, usersRef, allProjects, userDetails } = useContext(Data);
  const [loading, setLoading] = useState(true);
  const [singleProject, setSingleProject] = useState({});
  const [show, setShowNotification] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [message, setMessage] = useState("");
  const [projectChat, setProjectChat] = useState([]);
  const [currentRoom, setCurrentRoom] = useState(props.match.params.id);
  const [typingStatus, setTypingStatus] = useState({ who: "", typing: false });
  useEffect(async () => {
    const doc = await projectsRef.doc(props.match.params.id).get();
    if (!doc.exists) {
      props.history.push("/");
      return;
    }
    if (!doc.data().team.includes(userDetails.email)) props.history.push("/");
    setSingleProject(doc.data());
    setLoading(false);
    setMessage("");
    setProjectChat([]);
    socket.emit("join-this-project-room", props.match.params.id);
    if (currentRoom !== props.match.params.id) {
      socket.emit("disconnect-from-this-room", currentRoom, userDetails.email);
      setCurrentRoom(props.match.params.id);
    }

    axios
      .post("http://localhost:5000/auth/projectMessages", {
        roomId: props.match.params.id,
      })
      .then((res) => {
        console.log(res);
        setProjectChat(res.data);
        setMessage("");
      });
  }, [props.match.params.id]);
  // useEffect(() => {
  //   console.log(currentRoom);
  // }, [currentRoom]);
  useEffect(() => {
    socket.emit("join-this-project-room", props.match.params.id);
    socket.on("delete-message", (id) => {
      setProjectChat((prev) => prev.filter((item) => item._id !== id));
    });
    socket.on("new-message", (newMessage) => {
      setProjectChat((prev) => [...prev, newMessage]);
      setMessage("");
    });
    socket.on("left-chat", (data) => {
      console.log(data);
      setProjectChat((prev) => [...prev, data]);
      setMessage("");
    });
    socket.on("typing-started", (who) => {
      setTypingStatus({ who: who, typing: true });
    });
    socket.on("typing-stopped", (who) => {
      setTypingStatus({ who: who, typing: false });
    });
  }, []);

  const sendMessage = async () => {
    const res = await axios.post("http://localhost:5000/auth/newMessage", {
      message,
      sender: userDetails.email,
      mentioned: [],
      roomId: props.match.params.id,
    });
    console.log(res);
    // setProjectChat((prev) => [...prev, res.data]);
  };
  const addNewPartener = async () => {
    const email = newUserEmail;
    try {
      setNewUser("");
      const currentProject = singleProject;
      if (currentProject.requestedUsers.includes(email)) {
        throw { code: "already requested" };
      }
      if (email === userDetails.email) {
        throw { code: "can not request yourself" };
      }
      const doc = await usersRef.doc(email).get();
      if (doc.exists) {
        const projectRequests = doc.data().projectRequests
          ? doc.data().projectRequests
          : [];
        await usersRef.doc(email).update({
          projectRequests: [
            ...projectRequests,
            {
              id: currentProject.id,
              name: currentProject.name,
              owner: userDetails.name,
              email: currentProject.owner,
            },
          ],
        });
        await projectsRef.doc(currentProject.id).update({
          requestedUsers: [...currentProject.requestedUsers, email],
        });
      } else {
        throw { code: "no such user" };
      }
    } catch (err) {
      console.log(err);
      setNewUser(email);
    }
  };
  const deleteMessage = async (id) => {
    const res = await axios.post("http://localhost:5000/auth/deleteMessage", {
      roomId: currentRoom,
      _id: id,
    });
  };
  return (
    <div>
      {typingStatus.typing && <h1>{typingStatus.who} typing...</h1>}
      <hr />
      {projectChat.map((chat, pos) => {
        return (
          <p key={pos}>
            {chat.message} - {chat.sender} -{" "}
            {chat.sender === userDetails.email && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  deleteMessage(chat._id);
                }}
              >
                Delete
              </button>
            )}
          </p>
        );
      })}
      <div className="chat-input">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              sendMessage();
            }
          }}
          onFocus={() => {
            socket.emit(
              "typing-start",
              props.match.params.id,
              userDetails.email
            );
          }}
          onBlur={() => {
            socket.emit("typing-stop", props.match.params.id);
          }}
        />
      </div>
      {loading ? (
        <Loading />
      ) : (
        <div className="projects">
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
                  value={newUserEmail}
                  placeholder="ADD NEW PARTENER"
                  onChange={(e) => {
                    setNewUser(e.target.value);
                  }}
                />
                <span></span>
              </div>
              <div className="button">
                <CgAddR
                  size="3rem"
                  color="#866118"
                  onClick={addNewPartener}
                  style={{ cursor: "pointer" }}
                  className="add"
                />
              </div>
            </div>
            <div className="allProjects">
              {allProjects.map((item) => {
                return (
                  <Link
                    key={item.id}
                    className="linksss"
                    to={`/project/${item.id}`}
                    id={item.id === props.match.params.id ? "active" : ""}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </div>
            <div></div>
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
              <Link to={`/tasks/${props.match.params.id}`}> Tasks</Link>
              <Link to="/">Home</Link>
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
            <div className="mobile">
              <h2>{singleProject.name}</h2>
              <PieChart
                className="pie"
                data={[
                  {
                    title: "Completed",
                    value:
                      singleProject.completedTasks === 0
                        ? 0
                        : singleProject.completedTasks,
                    color: "#E38627",
                  },
                  {
                    title: "Totaltasks",
                    value:
                      singleProject.totalTasks === 0
                        ? 1
                        : singleProject.totalTasks,
                    color: "#C13C37",
                  },
                ]}
              />
              <h2>TEAM</h2>
              {singleProject.team.map((item, pos) => {
                return (
                  <div className="teamss" key={pos}>
                    <h3>{item}</h3>
                  </div>
                );
              })}
              <h2 className="req">Requested</h2>
              {singleProject.requestedUsers.map((item, pos) => {
                return (
                  <div className="teamss" key={pos}>
                    <h3>{item}</h3>
                  </div>
                );
              })}
            </div>
            <div className="allprojects">
              <div className="details">
                <h2>{singleProject.name}</h2>
                <PieChart
                  data={[
                    {
                      title: "Completed",
                      value:
                        singleProject.completedTasks === 0
                          ? 0
                          : singleProject.completedTasks,
                      color: "#E38627",
                    },
                    {
                      title: "Totaltasks",
                      value:
                        singleProject.totalTasks === 0
                          ? 1
                          : singleProject.totalTasks,
                      color: "#C13C37",
                    },
                  ]}
                />
              </div>
              <div className="team">
                <h2>TEAM</h2>
                {singleProject.team.map((item, pos) => {
                  return (
                    <div key={pos}>
                      <h3>{item}</h3>
                    </div>
                  );
                })}
                <h2 className="req">Requested</h2>
                {singleProject.requestedUsers.map((item, pos) => {
                  return (
                    <div key={pos}>
                      <h3>{item}</h3>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
        // <div className="project">
        //   <input
        //     type="text"
        //     value={newUserEmail}
        //     onChange={(e) => {
        //       setNewUser(e.target.value);
        //     }}
        //   />
        //   <button onClick={addNewPartener}>ADD NEW PARTENER</button>
        //   <Link to={`/tasks/${props.match.params.id}`}>
        //     <button>Tasks</button>
        //   </Link>
        // </div>
      )}
    </div>
  );
}

export default Project;
