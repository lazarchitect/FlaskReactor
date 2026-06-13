#!/bin/bash
nohup python -u deployer.py localhost 8087 > /home/pi/projects/FlaskReactor/deploy/logForDeployment.log 2>&1 &
