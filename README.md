# GitHub User Search App

A modern and responsive web application that allows users to search for GitHub profiles and view detailed information using the GitHub API.

---

## Features

* Search any GitHub user
* View profile details (avatar, bio, join date, etc.)
* Display stats (repositories, followers, following)
* Show latest 5 repositories
* Clickable repository links
* Loading spinner for better UX
* Error handling (User not found, API errors)
* Dark / Light mode toggle (with local storage)

---

## Tech Stack

* HTML5
* CSS3 (Responsive + Dark Mode)
* JavaScript (ES6+)
* Fetch API
* Async/Await

---

## Demo

👉 Add your demo video link here

---

## How It Works

1. User enters a GitHub username
2. App calls GitHub API:
   https://api.github.com/users/{username}
3. Displays profile data
4. Fetches repositories using repos_url
5. Shows latest 5 repositories

---

## Project Structure

├── index.html
├── style.css
├── script.js

---

## Error Handling

* Shows "User Not Found" if username is invalid
* Handles API rate limit errors
* Prevents app crash

---

## Learning Outcomes

* API integration using Fetch
* Async/Await handling
* DOM manipulation
* UI state management (loading, error, success)

---

## Future Improvements

* Add search history
* Add pagination for repositories
* Add comparison (Battle Mode)
* Improve accessibility

---

## Acknowledgment

This project is part of my internship at Prodesk IT.

---

## 📬 Contact

Your Name
A TEJASYA
