import React, { useContext, useEffect, useState } from "react";
import { Data } from "../../context/Context";
import { fieldValue } from "../../firebase/firebase";
import DateTimePicker from "react-datetime-picker";
import Header from "../../components/header/Header";
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
  const trackTime = (id) => {
    setClear(
      setInterval(async () => {
        const doc = await taskRef.doc(id).get();
        if (!doc.exists) clearInterval(clear);
        await taskRef.doc(id).update({ timeGiven: doc.data().timeGiven + 60 });
      }, 60000)
    );
  };
  return (
    <div>
      {loading ? (
        <h1>loading....</h1>
      ) : (
        <div>
          <Header projectId={project.id} />
          <input
            type="text"
            value={newTask}
            onChange={(e) => {
              setTask(e.target.value);
            }}
          />
          <DateTimePicker onChange={setDeadline} value={deadline} />
          <input type="text" list="users" />
          <datalist id="users">
            {project.team.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </datalist>
          <button onClick={addNewTask}>ADD NEW TASK</button>
          {allTasks.map((item, pos) => {
            return (
              <div
                className={`${
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
                        console.log(pos);
                        setTracking(true);
                        setPosition(pos);
                        trackTime(item.taskId);
                      }}
                    >
                      Play
                    </button>
                  )
                )}
                <h2>{Math.floor(item.timeGiven / 3600)} : </h2>
                <h2>{Math.floor(item.timeGiven / 60)}</h2>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Tasks;
