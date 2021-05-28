import React, { useContext, useState, useEffect } from "react";
import { Data } from "../../context/Context";

function Project(props) {
  const [newUserEmail, setNewUser] = useState("");
  const { projectsRef, usersRef, allProjects, userDetails } = useContext(Data);
  const [loading, setLoading] = useState(true);

  useEffect(async () => {
    const doc = await projectsRef.doc(props.match.params.id).get();
    if (!doc.exists) props.history.push("/");
    if (!doc.data().team.includes(userDetails.email)) props.history.push("/");
    setLoading(false);
  }, []);

  const addNewPartener = async () => {
    const email = newUserEmail;
    try {
      setNewUser("");
      const currentProject = allProjects.find(
        (item) => item.id === props.match.params.id
      );
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
  return (
    <div>
      {loading ? (
        <h1>loading...</h1>
      ) : (
        <>
          <input
            type="text"
            value={newUserEmail}
            onChange={(e) => {
              setNewUser(e.target.value);
            }}
          />
          <button onClick={addNewPartener}>ADD NEW PARTENER</button>
        </>
      )}
    </div>
  );
}

export default Project;
