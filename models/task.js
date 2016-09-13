'use strict'; // strict mode
const db = require('../db');
const helpers = require('../helpers/test');

module.exports = {
  createTask: (task) => (
    new Promise((resolve, reject) => {
      const curDate = new Date();
      db.cypher({
        query: `MATCH (user: User) 
        WHERE ID(user)={userID}
          CREATE (task:Task {
          address: {address},
          taskName:{taskName},
          desc: {desc},
          type: {type},
          status: {status},
          assigneeCompleted: {assigneeCompleted},
          requestorCompleted: {requestorCompleted},
          difficulty:{difficulty},
          creationDate:{creationDate},
          deadlineDate:{deadlineDate},
          userID: {userID}
        })-[:created_by]->(user) RETURN task`,
        params: {
          address: task.address,
          taskName: task.taskName,
          desc: task.desc,
          type: task.type,
          status: 'requested',
          assigneeCompleted: false,
          requestorCompleted: false,
          difficulty: task.difficulty,
          creationDate: curDate,
          deadlineDate: task.deadlineDate,
          userID: task.userID,
        },
      }, (err, results) => {
        console.log('creating task');
        if (err) {
          console.log(err);
          return reject(err);
        }
        if (!results.length) {
          console.log('no user found for this task', results);
          return resolve({ message: 'no user found for this task' });
        }
        console.log(results);
        return resolve(results);
      });
    })
  ),

  getAllTasks: () => (
    new Promise((resolve, reject) => {
      db.cypher({
        query: 'MATCH (task:Task) RETURN task',
      }, (err, results) => {
        if (err) {
          return reject(err);
        }
        if (!results.length) {
          console.log('No task found.');
          return resolve({ message: 'No tasks found on the server' });
        }
        console.log(`Sending ${results.length} tasks`);
        return resolve(results);
      });
    })
  ),
  getAllRequestedTasks: () => (
    new Promise((resolve, reject) => {
      db.cypher({
        query: 'MATCH (task:Task) Where task.status = "requested" RETURN task',
      }, (err, results) => {
        if (err) {
          return reject(err);
        }
        if (!results.length) {
          console.log('No task found.');
          return resolve({ message: 'No tasks found on the server' });
        }
        console.log(`Sending ${results.length} tasks`);
        return resolve(results);
      });
    })
  ),
  assignTasks: (taskId, userId) => (
    new Promise((resolve, reject) => {
      db.cypher({

        query: `MATCH (task:Task),(user:User)
          WHERE ID(task)=${taskId} AND ID(user)=${userId}
          CREATE (task)-[a:assigned_to]->(user)
          SET task.status = "assigned"
          RETURN task ,user, a`,
      }, (err, results) => {
        if (err) {
          return reject(err);
        }
        if (!results.length) {
          console.log('No task found.');
          return resolve({ message: 'No tasks found on the server' });
        }
        console.log('Task assigned', results);
        return resolve(results);
      });
    })
  ),
  getTaskById: (taskId) => (
    // Promise template
    new Promise((resolve, reject) => {
      db.cypher({
        query: 'MATCH (task) WHERE ID(task)={id} RETURN task',
        params: {
          id: taskId,
        },
      },
      (err, results) => {
        if (err) {
          return reject(err);
        }
        console.log(results);
        return resolve(results);
      });
    })
),
  updateTaskById: (taskId, newPropsObj) => (
    new Promise((resolve, reject) => {
      const paramsToSet = helpers.stringifyTask(newPropsObj);
      const ID = taskId;
      db.cypher({
        query: `MATCH (task:Task)
        WHERE ID(task)=${ID}
        SET ${paramsToSet}
        RETURN task`,
        params: newPropsObj,
      },
      (err, result) => {
        if (err) {
          return reject(err);
        }
        console.log(result);
        return resolve(result);
      });
    })
  ),
  getTasksByUserId: (userId) => (
    // Promise template
    new Promise((resolve, reject) => {
      db.cypher({
        query: 'MATCH (task:Task {userID: {userID}}) RETURN task',
        params: { userID: userId },
      },
      (err, result) => {
        if (err) {
          return reject(err);
        }
        console.log(result);
        return resolve(result);
      });
    })
  ),
  getTasksAssignedByUserId: (userId) => (
    // Promise template
    new Promise((resolve, reject) => {
      db.cypher({
        query: `MATCH (user:User), (task:Task)
        WHERE ID(user)=${userId} AND (user)-[:assigned_to]-(task) AND task.status="assigned"
        RETURN task`,
      },
      (err, result) => {
        if (err) {
          return reject(err);
        }
        console.log(result);
        return resolve(result);
      });
    })
  ),
  getTasksCreatedByUserId: (userId) => (
    // Promise template
    new Promise((resolve, reject) => {
      console.log('usereid: ', userId);
      db.cypher({
        query: `MATCH (user:User), (task:Task)
        WHERE ID(user)=${userId} AND (user)-[:created_by]-(task) AND task.status="assigned"
        RETURN task`,
      },
      (err, result) => {
        if (err) {
          return reject(err);
        }
        console.log(result);
        return resolve(result);
      });
    })
  ),
  getTasksCompletedByUserId: (userId) => (
    // Promise template
    new Promise((resolve, reject) => {
      db.cypher({
        query: `MATCH (user:User), (task:Task)
        WHERE ID(user)=${userId} AND (user)-[:assigned_to]-(task) AND task.status="completed"
        RETURN task`,
      },
      (err, result) => {
        if (err) {
          return reject(err);
        }
        console.log(result);
        return resolve(result);
      });
    })
  ),
  getTasksCompletedForUserByUserId: (userId) => (
    // Promise template
    new Promise((resolve, reject) => {
      db.cypher({
        query: `MATCH (user:User), (task:Task)
        WHERE ID(user)=${userId} AND (user)-[:created_by]-(task) AND task.status="completed"
        RETURN task`,
      },
      (err, result) => {
        if (err) {
          return reject(err);
        }
        console.log(result);
        return resolve(result);
      });
    })
  ),
  completeAssigneeTaskByTaskId: (taskId) => (
    // Promise template
    new Promise((resolve, reject) => {
      console.log(taskId);
      db.cypher({
        query: `MATCH (task:Task)
        WHERE ID(task)=${taskId}
        RETURN task`,
      },
      (err, result) => {
        if (err) {
          return reject(err);
        }
        console.log(result);
        return resolve(result);
      });
    }).then(result => {
      console.log(result[0].task.properties.requestorCompleted);
      if (result[0].task.properties.requestorCompleted) {
        db.cypher({
          query: `MATCH (task:Task)
          WHERE ID(task)=${taskId}
          SET task.assigneeCompleted=true , task.status='completed'
          RETURN task`,
        },
      (err, result) => {
        if (err) {
          return (err);
        }
        console.log(result);
        return (result);
      });
      } else {
        db.cypher({
          query: `MATCH (task:Task)
          WHERE ID(task)=${taskId}
          SET task.assigneeCompleted='true'
          RETURN task`,
        },
      (err, result) => {
        if (err) {
          return (err);
        }
        console.log(result);
        return (result);
      });
      }
    })
  ),

  completeRequestorTaskByTaskId: (taskId) => (
    // Promise template
    new Promise((resolve, reject) => {
      console.log(taskId);
      db.cypher({
        query: `MATCH (task:Task)
        WHERE ID(task)=${taskId}
        RETURN task`,
      },
      (err, result) => {
        if (err) {
          return reject(err);
        }
        console.log(result);
        return resolve(result);
      });
    }).then(result => {
      console.log(result[0].task.properties.assigneeCompleted);
      if (result[0].task.properties.assigneeCompleted) {
        db.cypher({
          query: `MATCH (task:Task)
          WHERE ID(task)=${taskId}
          SET task.requestorCompleted=true , task.status='completed'
          RETURN task`,
        },
      (err, result) => {
        if (err) {
          return (err);
        }
        console.log(result);
        return (result);
      });
      } else {
        db.cypher({
          query: `MATCH (task:Task)
          WHERE ID(task)=${taskId}
          SET task.requestorCompleted='true'
          RETURN task`,
        },
      (err, result) => {
        if (err) {
          return (err);
        }
        console.log(result);
        return (result);
      });
      }
    })
  ),

  deleteTaskById: (taskId) => (
    // Promise template
    new Promise((resolve, reject) => {
      db.cypher({
        query: 'START n=node({id}) MATCH (n)-[r]-() DELETE r, n',
        params: {
          id: taskId,
        },
      },
      (err, results) => {
        if (err) {
          console.log(err);
          return reject(err);
        }
        console.log(results);
        return resolve(results);
      });
    })
  ),
};
