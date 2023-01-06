Project to learn ReactJS. The backend is hosted in Flask and the database is PostgreSQL.

The app is a web-hosted board game site, where you can play against your friends.

Playable website at http://flaskreactor.com

BACKGROUND:
After being frustrated by the "MERN" stack, I decided to change my database of choice to PostgreSQL in order to learn that as well. Turns out Postgres has native JSON handling. It's also just super flexible overall.

I've also added Jenkins and Docker to the list of fun cool technologies that are being learned in this project. I set up Jenkins and Docker services in Linux, running on local hardware. The idea is to redeploy the application whenever changes get pushed to Github. This process is still in testing and configuration - Jenkins doesn't want to play nice. Docker, however, was a total breeze and is simply refreshing to work with.

UPDATE: Jenkins has proven time and time again to not play nice with Docker/Dockerfiles, which is really the meat and potatoes of what I want to do. Jenkins seems less important in the grand scheme of things, as Github only really sends a simple JSON HTTP POST request. So.... I've decided to go ahead and make my own deployment pipeline out of ..... Flask! A separate flask web app running on a separate port will handle the commit updates from Github, and rebuild and redeploy the Docker container for the main application automatically, after validating the request's authenticity using HMAC hexdigests.
