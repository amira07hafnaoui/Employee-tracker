const mysql = require('mysql');
const inquirer = require('inquirer');
const chalk = require('chalk');
const cTable = require('console.table');
const connection = require('./config/connection')
const startScreen = ['View all Employees', 'View all Employees by Department','View all Departments','View all Roles' , 'Add Employee','Add Department','Add Role','Update Employee Role', 'Remove Employee','Remove Department','Remove Role', 'Exit']
const allEmployeeQuery = `SELECT e.id, e.first_name AS "First Name", e.last_name AS "Last Name", r.title, d.department_name AS "Department", IFNULL(r.salary, 'No Data') AS "Salary", CONCAT(m.first_name," ",m.last_name) AS "Manager"
FROM employees e
LEFT JOIN roles r 
ON r.id = e.role_id 
LEFT JOIN departments d 
ON d.id = r.department_id
LEFT JOIN employees m ON m.id = e.manager_id
ORDER BY e.id;`
const startApp = () => {
    inquirer.prompt({
        name: 'menuChoice',
        type: 'list',
        
        message: 'Select an option',
        choices: startScreen

    }).then((answer) => {
        switch (answer.menuChoice) {
            case 'View all Employees':
                showAll();
                break;
            case 'View all Employees by Department':
                showByDept();
                break;
            case 'View all Departments':
                viewDept();
                break;
            case 'View all Roles':
                viewRoles();
                break;
            case 'Add Employee':
                addEmployee();
                break;
            case 'Add Department':
                addDept();
                break;
            case 'Add Role':
                addRole();
                break;
            case 'Update Employee Role':
                updateRole();
                break;
            case 'Remove Employee':
                removeEmployee();
                break;
            case 'Remove Role':
                removeRole();
                break;
            case 'Remove Department':
                removeDept();
                break;
            case 'Exit':
                connection.end();
                break;
        }
    })
}

const showAll = () => {
    connection.query(allEmployeeQuery, (err, results) => {
        if (err) throw err;
        console.log(' ');
        console.table(chalk.yellow('All Employees'), results)
        startApp();
    })

}

const showByDept = () => {
    const deptQuery = 'SELECT * FROM departments';
    connection.query(deptQuery, (err, results) => {
        if (err) throw err;

        inquirer.prompt([
            {
                name: 'deptChoice',
                type: 'list',
                choices: function () {
                    let choiceArray = results.map(choice => choice.department_name)
                    return choiceArray;
                },
                message: 'Select a Department to view:'
            }
        ]).then((answer) => {
            let chosenDept;
            for (let i = 0; i < results.length; i++) {
                if (results[i].department_name === answer.deptChoice) {
                    chosenDept = results[i];
                }
            }

            const query = 'SELECT e.id, e.first_name AS "First Name", e.last_name AS "Last Name", r.title AS "Title", d.department_name AS "Department", r.salary AS "Salary" FROM employees e INNER JOIN roles r ON r.id = e.role_id INNER JOIN departments d ON d.id = r.department_id WHERE ?;';
            connection.query(query, { department_name: chosenDept.department_name }, (err, res) => {
                if (err) throw err;
                console.log(' ');
                console.table(chalk.yellow(`All Employees by Department: ${chosenDept.department_name}`), res)
                startApp();
            })
        })
    })
}
const viewDept = () => {
    query = `SELECT department_name AS "Departments" FROM departments`;
    connection.query(query, (err, results) => {
        if (err) throw err;

        console.log('');
        console.table(chalk.yellow('All Departments'), results)
        startApp();
    })
}
const viewRoles = () => {
    let query = `SELECT title AS "Title" FROM roles`;
    connection.query(query, (err, results) => {
        if (err) throw err;

        console.log(' ');
        console.table(chalk.yellow('All Roles'), results);
        startApp();
    })

}
function addEmployee () {
    inquirer
      .prompt({
        name: "employeeAdd",
        type: "input",
        message: ["To ADD an employee, enter Employee First Name then Last Name"]
      })
  
      .then(function (answer) {
        console.log(answer)
        var str = answer.employeeAdd;
        var firstAndLastName = str.split(" ");
        console.log(firstAndLastName);
        var query = "INSERT INTO employees (first_name, last_name) VALUES ?";
        connection.query(query, [[firstAndLastName]], function (err, res) {
        startApp();
          
        });
      })
  }

  
  function addDept(){
    query = `SELECT department_name AS "Departments" FROM departments`;
    connection.query(query, (err, results) => {
        if (err) throw err;

        console.log('');
        console.table(chalk.yellow('List of current Departments'), results);

        inquirer.prompt([
            {
                name: 'newDept',
                type: 'input',
                message: 'Enter the name of the Department to add:'
            }
        ]).then((answer) => {
            connection.query(`INSERT INTO departments(department_name) VALUES( ? )`, answer.newDept)
            startApp();
        })
    })

  }
function addRole() {
    inquirer
      .prompt({
        name: "title",
        type: "input",
        message: ["Enter new role name"]
      })
      .then(function (answer) {
        var title = answer.title;
  
        inquirer
          .prompt({
            name: "salary",
            type: "input",
            message: ["Enter new role salary"]
          })
          .then(function (answer) {
            var salary = answer.salary;
  
            inquirer
              .prompt({
                name: "department_id",
                type: "input",
                message: ["Enter new role department id"]
              })
              .then(function (answer) {
                var department_id = answer.department_id;
  
                console.log(`title: ${title} salary: ${salary} department id: ${department_id}`);
  
                var query = "INSERT INTO roles (title, salary, department_id) VALUES ?";
                connection.query(query, [[[title, salary, department_id]]], function (err, res) {
                  if (err) {
                    console.log(err);
                  }
  
                  startApp();
                });
              })
          })
      })
  
  }
  function updateRole(){
    console.log('updating emp');
    inquirer
      .prompt({
        name: "id",
        type: "input",
        message: "Enter employee id",
      })
      .then(function (answer) {
        var id = answer.id;
  
        inquirer
          .prompt({
            name: "roleId",
            type: "input",
            message: "Enter role id",
          })
          .then(function (answer) {
            var roleId = answer.roleId;
  
            var query = "UPDATE employees SET role_id=? WHERE id=?";
            connection.query(query, [roleId, id], function (err, res) {
              if (err) {
                console.log(err);
              }
              startApp();
            });
          });
      });
  }
  function removeEmployee() {
    inquirer
      .prompt({
        name: "employeeRemove",
        type: "input",
        message: "To REMOVE an employee, enter the Employee id",
  
      })
      .then(function (answer) {
        console.log(answer);
        var query = "DELETE FROM employees WHERE ?";
        var newId = Number(answer.employeeRemove);
        console.log(newId);
        connection.query(query, { id: newId }, function (err, res) {
        startApp();
  
        });
      });
  }

  removeRole = () => {
    query = `SELECT * FROM roles`;
    connection.query(query, (err, results) => {
        if (err) throw err;

        inquirer.prompt([
            {
                name: 'removeRole',
                type: 'list',
                choices: function () {
                    let choiceArray = results.map(choice => choice.title);
                    return choiceArray;
                },
                message: 'Select a Role to remove:'
            }
        ]).then((answer) => {
            connection.query(`DELETE FROM roles WHERE ? `, { title: answer.removeRole });
            startApp();

        })

    })

}
const removeDept = () => {
    query = `SELECT * FROM departments`;
    connection.query(query, (err, results) => {
        if (err) throw err;

        inquirer.prompt([
            {
                name: 'dept',
                type: 'list',
                choices: function () {
                    let choiceArray = results.map(choice => choice.department_name);
                    return choiceArray;
                },
                message: 'Select the department to remove:'
            }
        ]).then((answer) => {
            connection.query(`DELETE FROM departments WHERE ? `, { department_name: answer.dept })
            startApp();
        })
    })

}


startApp();