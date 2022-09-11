# Gemu MVC built using NodeJS, Express

This is an MVC implementation similar to Code Igniter using NodeJS and Express

## File tree

```
📦gemu_mvc
 ┣ 📂assets
 ┃ ┣ 📂scripts
 ┃ ┣ 📂stylesheets
 ┃ ┗ 📂images
 ┣ 📂controllers
 ┃ ┗ 📜Templates.js
 ┣ 📂models
 ┃ ┗  📜Template.js
 ┣ 📂system
 ┃ ┣ 📂core
 ┃ ┃ ┣ 📜config.js
 ┃ ┃ ┣ 📜Controller.js
 ┃ ┃ ┣ 📜Model.js
 ┃ ┃ ┣ 📜profiler.ejs
 ┃ ┃ ┣ 📜QueryBuilder.js
 ┃ ┃ ┣ 📜routes.js
 ┃ ┃ ┗ 📜server.js
 ┃ ┗ 📂helper
 ┃   ┗ 📜helper.js
 ┣ 📂views
 ┃ ┣ 📂partials
 ┃ ┃ ┗ 📜head.ejs
 ┃ ┗ 📜default.ejs
 ┣ 📜app.js
 ┣ 📜config.yaml
 ┣ 📜LICENSE
 ┣ 📜package-lock.json
 ┣ 📜package.json
 ┗ 📜README.md
```

## Table of contents

- [Gemu MVC built using NodeJS, Express](#gemu-mvc-built-using-nodejs-express)
  - [File tree](#file-tree)
  - [Table of contents](#table-of-contents)
  - [Main Features](#main-features)
  - [Critical missing features](#critical-missing-features)
  - [Extra features](#extra-features)
  - [Future features](#future-features)
  - [Installation](#installation)
  - [Using the application](#using-the-application)
    - [Configuration](#configuration)
    - [Controller](#controller)
    - [Views](#views)
    - [Model](#model)
    - [Helper](#helper)

## Main Features

-   [x] Automatic creation of routes based on controller class and methods
-   [x] Easy config with YAML
-   [x] Easy rerouting using routes in config
-   [x] Built-in profiler including redirect
-   [x] Easy templating with EJS template
-   [x] Easy view and partial partial view system
-   [x] Easy model system with query builder
-   [x] Easy mySQL singleton pool database connection
-   [x] Easy PostgreSQL singleton pool database connection
-   [x] Supported mongoDB database connection
-   [x] Built-in commands wrapped in async/await and promises
-   [x] Persistent session with Redis (Need Redis server)

## Critical missing features

-   [ ] Update in query builder
-   [ ] Delete in query builder

## Extra features

-   [x] Flash data implementation

## Future features

-   [ ] Profiler with and ajax
-   [ ] Better view template
-   [ ] Adding better controller and model templates
-   [ ] Create a better all-encompassing inline-styles for the profiler
-   [ ] Add an auto-loader
-   [ ] Add a user helper file system

## Installation

Copy the files to your directory and run in your directory terminal:

```bash
npm install
```

This will install the following dependencies.
-bcryptjs
-ejs
-express
-express-session
-mysql2

You will also need nodeJs and nodemon.

## Using the application

### Configuration

1. Configure your config.js file in the root.
    1. Feel free to turn on or off the profiler.
2. Set your local port.
3. Set your database or ppol config.
4. (Optional) Change your session config.

Now, you are ready to use run the application.

Run in your directory terminal:

```bash
nodemon app.js
```

Go to your local host with the appropriate port to see the sample template.

### Controller

1. Go to the controllers folder and open the sample template.
2. In order to create new controller, you have to use the sample controller template format.
    1. Import/require the controller file.
    2. Import/require the needed model file.
    3. Declare the model first as a private variable before creating a new instance in the constructor. Declaring the model as private is important. If you don't follow this convention, the application will interpret all the methods from the model as url/routes of your application.
3. Create your new routes by creating new method in your controller class. It is recommended to use fat arrow function for methods to prevents rebinding of this. Also, it is recommended to use async and await to all your methods.
4. In order to change your existing routes, go to your config.js in your root folder. Under the routes, declare the base url/routes (this is your /Controller/Method) with trailing slash as your key and your new route as the value. Please follow the nodeJS convention for the get parameters and queries.
5. It is recommended to declare non-view functions outside the class. However, if you really want create a method instead of function, please add an underscore at the start of the function name. This will prevent the application in mistaking it as a route.
6. Please use the built-in \_view method to display the page. It uses a built-in EJS template and takes advantage of the partial page system. You can easily reuse component for your page like your head, navigation bar(to be implemented), and footer(to be implemented). Just add the pathname through the third parameter using the convention: {"variableName":"path"} then add the new component in your default.ejs file. You can also send data from your controller to your view through this template using the data key.
7. When call the model method, please make sure to pass the response to the method involving the database. This is used to record the query for the profiler.
8. You can create flash data using \_flash command and displaying it with \_flashdata.

### Views

Gemu MVC uses partial view so you can create the view using components. The default.ejs in views folder act as the main html where you can add component using the includes ejs keyword. You can then easily declare it through the built-in view function. Follow the line used for the dynamic head or content when declaring new components.
Declaration in controller = {varName: "URL/Routes"}
Declaration in default.ejs = <% if(varName!==""){ %> <%- include(varName,{data}) %> <% } %>

(Currently, the default.ejs only has dynamic title, head, content, and profiler. default.ejs will be updated in the future.)

### Model

1. Go to the models folder and open the sample template.
2. In order to create new controller, you have to use the sample controller template format.
    1. Import/require the query builder file.
    2. (Optional) Import/require the needed helper file.
3. You can now create your own model method for data validation and connecting with database.
    1. You can either use the connectToDatabase method or connectToPool method. I have implemented a simple singleton sytem for this.
    2. Create your query with either the this.qb or on your own.
    3. Use the built-in this.query method to display the results of the query. Please take note that you have to pass the response to the this.query method for the profiler. (Safeguard will be added in the future or a better implementation for mysql query profiler)
    4. Profit!

### Helper

-   [x] isBetween - Checks it he value us between the two parameter
-   [x] isValidEmail - Checks if the email is valid
-   [x] isValidName - Checks if the name is valid
-   [x] getObjKey - Checks what the key of the values is in the object
