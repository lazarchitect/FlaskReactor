from flask import Flask, request
import docker
import os
import hmac
import hashlib
from docker.errors import NotFound as NotFoundError
from sys import argv
from threading import Thread

deployer = Flask(__name__)

name="app"
tag ="flaskreactor:latest"

@deployer.route("/github-webhook", methods=["POST"])
def process_webhook():

    if not authenticated(request):
        return "who dis?", 401

    body = request.json
    ref = body["ref"]
    commitId = body["after"][0:7]
    if(ref != "refs/heads/master"):
        return "This is not master branch.", 400


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

    print("starting redeploy")
    try:
        old_container = client.containers.get(name)
        old_container.stop()
        old_container.remove()
        print("old container stopped and removed")
    except NotFoundError:
        pass
        print("old container not found")

    print("Pulling latest code repo changes...")
    os.system("git pull") # runs shell cmd

    print("Building new image")
    (newImage, logs) = client.images.build(path = ".", tag = tag)

    print("new image built. Running new container....")
    client.containers.run(newImage, name=name, ports = {5000:5000}, environment={"DEPLOY_VERSION": commitId}, detach=True)
    print("done. commit " + commitId + " deployed.")


if __name__ == "__main__":
    deployer.run(host=argv[1], port=int(argv[2]))
