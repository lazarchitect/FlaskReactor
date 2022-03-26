from flask import Flask, request
import docker
import os
import hmac
import hashlib
from docker.errors import NotFound as NotFoundError
from sys import argv
from threading import Thread
import logging

logging.basicConfig(filename='logForDeployment.log', format='%(levelname)s: (%(asctime)s) %(message)s', level=logging.DEBUG)

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
    if(ref != "refs/heads/master"):
        return "Not master branch, ignoring", 400


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
    except:
        return False
    return hmac.compare_digest(remote_hash, local_hash)

def redeploy(commitId):
    client = docker.from_env()

    logging.info("starting redeploy")
    try:
        old_container = client.containers.get(name)
        old_container.stop()
        old_container.remove()
        logging.info("old container stopped and removed")
    except NotFoundError:
        pass
        logging.warning("old container not found")

    logging.info("Pulling latest code repo changes...")
    os.system("git pull") # runs shell cmd

    logging.info("Building new image")
    (newImage, logs) = client.images.build(path = ".", tag = tag)

    logging.info("new image built. Running new container....")
    client.containers.run(newImage, name=name, ports = {5000:5000}, environment={"DEPLOY_VERSION": commitId}, detach=True)
    logging.info("done. commit " + commitId + " deployed.")


if __name__ == "__main__":

    host = argv[1]
    port = int(argv[2])

    logging.info("Starting Deployer Script.")
    logging.info("host: " + host)
    logging.info("port: " + str(port))
    logging.info("Process ID: " + str(os.getpid()))

    deployer.run(host=argv[1], port=int(argv[2]))
