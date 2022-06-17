import React, { useContext, useEffect, useState } from "react";
import { Data } from "../../context/Context";
import { fieldValue } from "../../firebase/firebase";
import DateTimePicker from "react-datetime-picker";
import Header from "../../components/header/Header";
import Loading from "../../components/Loading/Loading";
import "./tasks.css";
import swal from "sweetalert";

function Tasks(props) {
  const { projectsRef, usersRef, userDetails, allProjects } = useContext(Data);
  const taskRef = projectsRef.doc(props.match.params.id).collection("tasks");
  const [loading, setLoading] = useState(true);
  const [allTasks, setAllTasks] = useState([]);
  const [newTask, setTask] = useState("");
  const [allUsers, setAllUsers] = useState([]);
  const [project, setCurrentProject] = useState({});
  const [deadline, setDeadline] = useState(new Date());
  const [tracking, setTracking] = useState(false);
  const [position, setPosition] = useState(-1);
  const [clear, setClear] = useState(null);
  const [currentTask, setCurrentTask] = useState("");
  const [time, setTime] = useState(0);
  const [sec, setSec] = useState(0);
  useEffect(async () => {
    const currentProject = allProjects.find(
      (item) => item.id === props.match.params.id
    );
    setCurrentProject(currentProject);
    await taskRef.orderBy("createdAt").onSnapshot((doc) => {
      const arr = [];
      doc.forEach((item) => {
        arr.push(item.data());
      });
      console.log(arr);
      setAllTasks(arr);
      usersRef
        .where("projects", "array-contains", props.match.params.id)
        .onSnapshot((doc) => {
          const userArr = [];
          doc.forEach((item) => {
            userArr.push(item.data());
          });
          console.log(userArr);
          setAllUsers(userArr);
          setLoading(false);
        });
    });
  }, []);

  const addNewTask = async () => {
    const task = newTask;
    const date = deadline;
    const taskarr = allTasks;
    if (!task) {
      swal("", "Must have a task Name", "error");
      return;
    }
    if (date === new Date().getTime()) {
      swal("", "Add a deadline", "error");
      return;
    }
    try {
      setTask("");
      setDeadline(new Date());
      await taskRef.doc(`task-${allTasks.length + 1}`).set({
        title: task,
        taskCreater: userDetails.email,
        createdAt: fieldValue.serverTimestamp(),
        deadline: date,
        assignedTo: "",
        priority: 0,
        taskId: `task-${allTasks.length + 1}`,
        timeGiven: 0,
        completed: false,
        trashed: false,
      });
      await projectsRef
        .doc(project.id)
        .update({ totalTasks: taskarr.length + 1 });
    } catch (err) {
      console.log(err);
      setTask(task);
      setDeadline(date);
    }
  };

  const trackTime = (startTime) => {
    setTime(startTime);
    setClear(
      setInterval(() => {
        setTime((prev) => prev + 1);
      }, 1000)
    );
  };
  useEffect(() => {
    setSec(() => {
      if (sec > 60) {
        return 0;
      } else {
        return time % 60;
      }
    });
  }, [time]);
  return (
    <div>
      {loading ? (
        <Loading />
      ) : (
        <div className="task__container">
          <div className="task__left__container">
            <h1 className="title">Create New Task</h1>
            <input
              className="input"
              placeholder="Task Name"
              type="text"
              value={newTask}
              onChange={(e) => {
                setTask(e.target.value);
              }}
            />
            <DateTimePicker
              className="input"
              onChange={setDeadline}
              value={deadline}
            />
            <input
              type="text"
              list="users"
              className="input"
              placeholder="Assignee"
            />
            <datalist id="users">
              {project.team.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </datalist>
            <button
              className="login__btn"
              style={{ zIndex: 0 }}
              onClick={addNewTask}
            >
              ADD NEW TASK
            </button>
          </div>
          <div className="task__right__container">
            <div className="header__wrapper">
              <Header projectId={project.id} />
            </div>
            {/* {`${Math.floor(time / 3600)} : ${Math.floor(time / 60)} : ${sec}`} */}
            <div className="task__cont">
              {allTasks.map((item, pos) => {
                return (
                  <div
                    className={`task__card ${
                      item.deadline?.seconds - item.createdAt?.seconds < 84600
                        ? "red"
                        : item.priority > 0
                        ? "important"
                        : ""
                    }`}
                    key={item.taskId}
                  >
                    <p>{item.title}</p>
                    {tracking ? (
                      pos === position ? (
                        <button
                          onClick={() => {
                            setTracking(false);
                            setPosition(-1);
                            clearInterval(clear);
                            taskRef.doc(currentTask.split("_")[0]).update({
                              timeGiven: time,
                            });
                          }}
                        >
                          Pause
                        </button>
                      ) : (
                        ""
                      )
                    ) : (
                      userDetails.email === item.assignedTo && (
                        <button
                          onClick={() => {
                            setTracking(true);
                            setPosition(pos);
                            // trackTime(item.taskId);
                            setCurrentTask(`${item.taskId}_${item.title}`);
                            trackTime(item.timeGiven);
                          }}
                        >
                          Play
                        </button>
                      )
                    )}
                    <div className="time">
                      <h2>{Math.floor(item.timeGiven / 3600)} : </h2>
                      <h2>{Math.floor(item.timeGiven / 60)}</h2>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Tasks;
