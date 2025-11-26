Firstly download a dump of your existing db. Replace `<db_host>`, `<db_user>` and `<db_name>` accordingly:\
`pg_dump -h <db_host> -U <db_user> -d <db_name> -Fc -f db.dump`

Then copy that file into the directory where you have cloned the repo for production deployment. If you haven't already make sure you have build the containers using this command:\
`docker compose up`

You should have two containers called `app` and `db` in your container registry.

Now copy the db dump you made earlier into the `db` container:\
`docker compose cp db.dump db:/tmp/db.dump`

Finally restore it inside the container. Replace `<ADMIN_USERNAME>` with the one configured in your .env file:\
`docker compose exec db pg_restore -U <ADMIN_USERNAME> -d hydra_db -O -x /tmp/db.dump`