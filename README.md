# FlixFlow: Online Streaming Website [https://flixflow.art]
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
## Overview

Welcome to FlixFlow, an innovative online streaming website crafted for a modern audience. This platform is not just about streaming movies; it's about creating an interactive community of movie enthusiasts. With a blend of robust backend technologies and a user-centric frontend, we offer a seamless movie-watching experience.

![Project Homepage](https://i.imgur.com/Ffm6ha9.png)

### Key Technologies

- **Backend**: Powered by Node.js and Express for performance and MongoDB for data storage.
- **Frontend**: Developed using ReactJS for dynamic interactivity, with CSS and HTML for styling and structure.
- **Video Streaming**: Utilizing Puppeteer for fetching high-quality streaming files.
- **Real-time Synchronization**: Featuring a unique synchronized viewing experience powered by Socket.io, allowing users to watch movies together in real time.
- **Movie Database**: Integrated with the TMDB API for an extensive collection and search functionality.

## Core Features

- **User Accounts**: Personal profiles for a customized streaming experience.
- **Favorites**: An option to bookmark favorite movies.
- **Playback Memory**: Resume watching from where you left off.
- **Search Movies**: Find movies easily using the TMDB API.
- **Watch Together**: Real-time movie watching with friends using Socket.io.

## Installation and Setup

### Prerequisites

You'll need:
- Node.js
- MongoDB
- A TMDB API key

### Installation Guide

1. **Clone the Repository**:
2. **Install Dependencies**:
3. **Set Up Environment**:
Create a `.env` file in the project root and populate it with the following variables:
- `MONGODB_LINK`: Your MongoDB connection URI.
- `SECRET`: A secret key for your application (used for encryption or session management).
- `TMDB_API`: Your TMDB API key.
- `GOOGLEPATH`: Path to your Google credentials file (if using Google APIs).
- `SEC`: Additional security-related configurations.
- `iv`: Initialization vector for cryptographic operations.
- `SERVERURL`: The URL where your server is accessible.
- `SERVERIP`: The IP address of your server.
- `port`: The port on which your server will listen.
4. **Launch the Server**:

## How to Use

Access the platform at `http://192.168.1.*:[port]`. Register to enjoy features like favorites, playback continuity, and synchronized movie watching with the 'Watch Together' feature.

## Contributing

Your contributions can make this project even better:

1. **Fork the Project**
2. **Create a Feature Branch** (`git checkout -b feature/AmazingFeature`)
3. **Commit Your Changes** (`git commit -m 'Add some AmazingFeature'`)
4. **Push to the Branch** (`git push origin feature/AmazingFeature`)
5. **Open a Pull Request**

## License

This project is under the MIT License. See `LICENSE` for more information.

## Contact

- Khaled Saleh : khaled.S.Saleh@hotmail.com
- Project Repository: https://github.com/KhaledSaleh122/flixflow