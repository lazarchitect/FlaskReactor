from flask import Flask, request
import docker
import os
import hmac
import hashlib
from docker.errors import NotFound as NotFoundError
from sys import argv

deployer = Flask(__name__)

name="app"
tag ="flaskreactor:latest"

@deployer.route("/github-webhook", methods=["POST"])
def redeploy():

    secret = open('secret_key.txt', 'r').read().encode('utf-8')

    local_hash = hmac.new(
        secret,
        msg=request.data,
        digestmod=hashlib.sha256
    ).hexdigest()

    remote_hash = request.headers['X-Hub-Signature-256'].split("=")[1]

    authenticated = hmac.compare_digest(remote_hash, local_hash)

    if not authenticated:
        return "who dis?"

    body = request.json
    ref = body["ref"]
    commitId = body["after"][0:7]
    if(ref != "refs/heads/master"):
        return "This is not master branch."

    client = docker.from_env()

    print("starting redeploy")
    try:
        old_container = client.containers.get(name)
        old_container.stop()
        old_container.remove()
        print("old container stopped and removed")
    except NotFoundError:
        pass
        print("old container not found")

    print("building new image")
    os.system("git pull") # runs shell cmd
    (newImage, logs) = client.images.build(path = ".", tag = tag)

    print("new image built. Running new container....")
    client.containers.run(newImage, name=name, ports = {5000:5000}, environment={"DEPLOY_VERSION": commitId}, detach=True)

    return "commit ID" + commitId + " now running." + \
           "To do:" + \
           "Return quickly while spawning a thread to do the heavy lifting."


if __name__ == "__main__":
    deployer.run(host=argv[1], port=int(argv[2]))
