# Migrating from another database

Firstly download a dump of your existing db. Replace `<db_host>`, `<db_user>` and `<db_name>` accordingly:\
`pg_dump -h <db_host> -U <db_user> -d <db_name> -Fc -f db.dump`

Then copy that file into the directory where you have cloned the repo for production deployment. If you haven't already make sure you have build the containers using this command:\
`docker compose up`

You should have two containers called `app` and `db` in your container registry.

Now copy the db dump you made earlier into the `db` container:\
`docker compose cp db.dump db:/tmp/db.dump`

Finally restore it inside the container. Replace `admin` with the one configured in your .env file if necessary:\
`docker compose exec db pg_restore -U admin -d hydra_db -O -x /tmp/db.dump`

# Setting up SSL certificate for nginx

If you are hosting this locally, you'll need to generate an SSL cert for it.

In the repo you are deploying from, run these commands:

<code>
mkdir -p certs 

openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout certs/local.key -out certs/local.crt -subj "/CN=\<HOSTNAME\>"
</code>

Replace `<HOSTNAME>` with the IP address or host name of the server