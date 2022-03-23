<<<<<<< HEAD
FROM python:3.7-buster

EXPOSE 5000

# Keeps Python from generating .pyc files in the container
ENV PYTHONDONTWRITEBYTECODE=1

# Turns off buffering for easier container logging
ENV PYTHONUNBUFFERED=1

WORKDIR /app
COPY . /app

RUN ["python", "-m", "pip", "install", "-r", "requirements.txt"]

ENTRYPOINT ["python"]

CMD ["app.py"]
=======
FROM python:3.7-buster

EXPOSE 5000

# Keeps Python from generating .pyc files in the container
ENV PYTHONDONTWRITEBYTECODE=1

# Turns off buffering for easier container logging
ENV PYTHONUNBUFFERED=1

WORKDIR /app
COPY . /app

RUN ["pip", "install", "-r", "requirements.txt"]

RUN ["git", "pull"]

ENTRYPOINT ["python"]

CMD ["app.py"]
>>>>>>> 957be0108d14bfd6d5b4c7c405907eb83420b354
