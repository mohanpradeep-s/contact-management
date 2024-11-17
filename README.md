
# Contact Management System

A React application that allows users to manage their contacts by performing CRUD operations (Create, Read, Update, Delete). This project integrates with Firebase Firestore for backend database services and uses React Hot Toast for user notifications.

## Features

- Add new contacts with detailed information.
- Edit the existing contact details.
- Delete the existing contact from the database.
- Paginate and search through the contact list.
- Prevent duplicate entries of contact record.
- Responsive and user-friendly UI.

## Technologies used

### Frontend
- #### React Js
- #### Material-UI
- #### React-Hot-Toast(for notifications)

### Backend
- #### Firebase Firestore(for database)

## Prerequisites

- Node.js installed on your system.
- Firebase account and Firestore database configured.

## Instructions to run project
- Download this project on your system and open this project on your code editor.

- Navigate to the contact-management folder.

- Open Terminal and run the below command.

```http
npm install / npm i
```
- The above command install all the neccessary dependencies for the project.

#### Setup Firebase
- Open any browser, type firebase or click [firebase.com]("https://firebase.google.com/")
- Go to firebase console, create new project if you don't have one.
- In the Firebase console, go to Firestore Database and enable it in your project.
- For add Firebase SDK to your project, Go to the Firebase Console and navigate to Project settings > General.
- Scroll to the Your apps section, and add a new Web App.
- Copy the Firebase config object (which includes keys like apiKey, authDomain, projectId, etc.).
- In your project after components folder, create new folder as firebase. Inside create a file "firebase.js" and paste the firebase SDK config object.

- You've to import firestore in the "firebase.js" file and export as well.

```http
import { getFirestore } from "firebase/firestore";

const db = getFirestore(app);
export {db};
```

- Then run your application in the terminal
```http
npm start
```
## Database Schema
- As the Firebase is a No-sql database, so there is database schema for it.
- But using table it look like the below table.

| **Field Name** | **Type**     | **Description**                                                |
|-----------------|--------------|----------------------------------------------------------------|
| `firstName`     | `string`     | First name of the contact.                                     |
| `lastName`      | `string`     | Last name of the contact.                                      |
| `email`         | `string`     | Email address of the contact (unique).                        |
| `phone`         | `string`     | Phone number of the contact (unique, must start with 6-9).    |
| `company`       | `string`     | Name of the company the contact works for.                    |
| `jobTitle`      | `string`     | Job title of the contact. 
