# Connecting your app to a domain via Cloudflare tunnels

These steps are roughly correct at the time of writing (Jan 2026) but the exact details my change with time. If in doubt, use Google.

Firstly, you must make sure your domain is added to Cloudflare and using Cloudflare nameservers.

After that, you can follow these steps:

1. Download and install `cloudflared` on your server [here](https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-tunnel/downloads/)
2. In a web browser, go to your **Cloudflare Zero Trust dashboard → Networks → Connectors → Cloudflare Tunnels → Create a tunnel**.
3. Choose Cloudflared as the connector type and name it (e.g. `hydra`).
4. Cloudflare will show install/run commands for your OS. If the operation is successful, the page will say a connection has been established successfully to your host.
5. On the route tunnel page, add your domain (and subdomain if applicable). 
   * Under **Service**, enter **Type:** `HTTP` and **URL:** `localhost:5001`
   * I recommend leaving the path blank. The app expects specific URL paths which might cause it to break.

If Cloudflare is able to reach your hosting server, your tunnel status should be **HEALTHY**. If something went wrong, it will say **INACTIVE**.

Make sure the app is running on the server (via `docker compose up -d`). If you visit your tunnel URL while the app isn't running you will get a `502 Bad Gateway`.

If this is the case there could be many reasons:
* `cloudflared` wasn't set up/started correctly
* Your server isn't properly connected to the internet
* Firewall/restrictions blocking your server from contacting cloudflare

In which case, try these steps again from scratch. If it still doesn't work, try troubleshooting online.