FROM python:latest

EXPOSE 5000

# Keeps Python from generating .pyc files in the container
ENV PYTHONDONTWRITEBYTECODE=1

# Turns off buffering for easier container logging
ENV PYTHONUNBUFFERED=1

WORKDIR /app
COPY . /app

RUN ["pip", "install", "-r", "requirements.txt"]

ENTRYPOINT ["python"]

CMD ["app.py"]
