import React, { useContext, useState } from "react";
import { Data } from "../../context/Context";
import { fieldValue } from "../../firebase/firebase";
import { Link } from "react-router-dom";
function Home(props) {
  const { allProjects, userDetails, projectsRef, usersRef } = useContext(Data);
  const [newProject, setNewProject] = useState("");
  const createNewProject = async () => {
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
    <div>
      <input
        type="text"
        value={newProject}
        onChange={(e) => {
          setNewProject(e.target.value);
        }}
      />
      <button onClick={createNewProject}>CREATE PROJECT</button>
      {allProjects.map((data, pos) => {
        return (
          <Link
            key={data.id}
            to={`/project/${data.id}`}
            style={{ display: "block" }}
          >
            {data.name}
          </Link>
        );
      })}
      {userDetails.projectRequests.map((item) => {
        return (
          <div key={item.id}>
            <p>{item.name}</p>
            <p>{item.owner}</p>
            <button
              onClick={() => {
                acceptProjectInvite(item.id);
              }}
            >
              ACCEPT
            </button>
            <button
              onClick={() => {
                rejectProjectInvite(item.id);
              }}
            >
              REJECT
            </button>
          </div>
        );
      })}
    </div>
  );
}

export default Home;
