import hashlib
import hmac
import logging
import os
import subprocess
from sys import argv
from threading import Thread

import docker
from docker.errors import NotFound as NotFoundError
from flask import Flask, request

logging.basicConfig(filename='logForDeployment.log', format='%(levelname)s: (%(asctime)s) %(message)s', level=logging.DEBUG)

os.environ["BUILDKIT_PROGRESS"] = "plain"

deployer = Flask(__name__)

name="app"
tag ="flaskreactor:latest"

@deployer.route("/github-webhook", methods=["POST"])
def process_webhook():

    if not authenticated(request):
        return "bad hash", 401

    body = request.json
    ref = body["ref"]
    commitId = body["after"][0:7]
    if(ref != "refs/heads/main"):
        return "Not main branch, ignoring", 200


    th = Thread(target=redeploy, args=(commitId,)) #comma needed in args to make it iterable
    th.start()

    return "Triggering Redeploy on commit " + commitId, 202

def authenticated(req):
    secret = open('secret_key.txt', 'r').read().encode('utf-8')

    local_hash = hmac.new(
        secret,
        msg=req.data,
        digestmod=hashlib.sha256
    ).hexdigest()

    try:
        remote_hash = request.headers['X-Hub-Signature-256'].split("=")[1]
    except [KeyError, IndexError]:
        return False
    return hmac.compare_digest(remote_hash, local_hash)

def redeploy(commitId):
    client = docker.from_env()

    logging.info("starting redeploy")

    logging.info("Pulling latest code repo changes...")
    subprocess.run("git pull")

    logging.info("Building new image")
    (newImage, buildLogs) = client.images.build(path = "..", tag = tag) # Dockerfile lives in parent folder

    for logDict in buildLogs:
        logging.info(logDict.get('stream'))
    logging.info("new image built")

    logging.info("removing old container...")
    try:
        old_container = client.containers.get(name)
        old_container.stop()
        old_container.remove()
        logging.info("old container stopped and removed")
    except NotFoundError:
        pass
        logging.warning("old container not found")

    logging.info("maintenance: pruning unused containers")
    client.containers.prune()
    client.images.prune()

    logging.info("Running new container...")

    # port 5000 inside container links to port 5000 of host machine
    portMapping = {5000:5000}
    # for securely mounting app_config at run time. Absolute path is needed
    volumeMapping = {"/home/pi/projects/FlaskReactor/resources/app_config.json": {"bind": "/app/resources/app_config.json", "mode": "ro"}}
    environmentMapping = {"DEPLOY_VERSION": commitId}
    container = client.containers.run(newImage, name=name, ports=portMapping, volumes=volumeMapping, environment=environmentMapping, detach=True)

    for line in container.logs(stream=True):
        logging.info(line.decode("utf-8").strip())

    logging.info("done. commit " + commitId + " deployed.")


if __name__ == "__main__":

    host = argv[1]
    port = int(argv[2])

    logging.info("Starting Deployer Script.")
    logging.info("host: " + host)
    logging.info("port: " + str(port))
    logging.info("Process ID: " + str(os.getpid()))

    deployer.run(host=argv[1], port=int(argv[2]))
