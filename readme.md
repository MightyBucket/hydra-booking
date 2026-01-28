# Hydra - lesson booking app

I know - not a very imaginative name!

This is an app I developed using React and Node, so that I could manage my lessons more easily as a private tutor.

I developed this mostly using Replit and its AI agent so this has been mostly vibe-coded. But it has been a really good exercise in bringing me up to speed again with modern full stack dev, which I haven't touched properly in a long time.

## Setting up
If you want you can install everything using `npm install`. But I set this up to run nicely as a set of docker containers.

1. Clone this repo to the machine you want to host from
2. Install `docker`
3. Open a terminal, navigate to this directory, then run `sudo docker compose up -d`

And you should be all set! The app will be accessible from `http://localhost:5001`

By default this app provides no HTTPS. If you wish to make this public, you should set this up behind a proxy that sorts out the HTTPS part.

That being said, I have hosted and connected my app via Cloudflare tunnels. There are instructions `cloudflared.md` to help set this up (mainly for myself, but also great if it helps anyone else)

