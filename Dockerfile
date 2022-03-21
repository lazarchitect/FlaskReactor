FROM ubuntu:16.04

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
