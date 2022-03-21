<<<<<<< HEAD
FROM ubuntu:16.04
=======
FROM python:3.7-buster
>>>>>>> 5c5dbccd523eb073121f3530692cc0bb7d915a4e

EXPOSE 5000

# Keeps Python from generating .pyc files in the container
ENV PYTHONDONTWRITEBYTECODE=1

# Turns off buffering for easier container logging
ENV PYTHONUNBUFFERED=1

WORKDIR /app
COPY . /app

RUN ["pip3", "install", "-r", "requirements.txt"]

ENTRYPOINT ["python3"]

CMD ["app.py"]
