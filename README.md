Project to learn ReactJS. The backend is hosted in Flask and the database is PostgreSQL.

The app is a web-hosted board game site, where you can play against your friends.

Playable website at http://flaskreactor.net

BACKGROUND:
After being frustrated by the "MERN" stack, I decided to change my database of choice to PostgreSQL in order to learn that as well. Turns out Postgres has native JSON handling. It's also just super flexible overall.

I've also added Jenkins and Docker to the list of fun cool technologies that are being learned in this project. I set up Jenkins and Docker services in Linux, running on local hardware. The idea is to redeploy the application whenever changes get pushed to Github. This process is still in testing and configuration - Jenkins doesn't want to play nice. Docker, however, was a total breeze and is simply refreshing to work with.

UPDATE: Jenkins has proven time and time again to not play nice with Docker/Dockerfiles, which is really the meat and potatoes of what I want to do. Jenkins seems less important in the grand scheme of things, as Github only really sends a simple JSON HTTP POST request. So.... I've decided to go ahead and make my own deployment pipeline out of ..... Flask! A separate flask web app running on a separate port will handle the commit updates from Github, and rebuild and redeploy the Docker container for the main application automatically, after validating the request's authenticity using HMAC hexdigests.

UPDATE 2: after a long slog that honestly caused me to walk away from the project for over a year, I've finally come back and solved a massive problem that was blocking me from making meaningful progress on the site - the lack of HTTPS. Since modern browsers practically mandate that HTTPS is used, presenting users with a "danger" screen if plain HTTP is used, that meant that I needed to register an SSL certificate for my site. Now, the process to do so is simple on paper - LetsEncrypt is a free public service that lets you install a tool which grants anyone with a certificate as long as they can prove that they own the server which is hosting a given site (domain name needed). But this meant I needed to host on port 80, which I was not doing, and it meant that I needed to serve static files alongside Flask routing, which is notoriously frustrating. After tooling around with Flask static files,  I finally decided to bite the bullet and bring in yet another technology to the stack - NGINX. I needed a webserver that could handle routing to files on the server (solely to attain the certificate, mind you), as well as handle HTTPS + HTTP routing, and point to my Flask routes upstream. Well, it was actually quite simple to install and configure NGINX, so, here we are.
