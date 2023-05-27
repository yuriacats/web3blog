FROM ubuntu:18.04
RUN apt-get update
RUN apt-get install -y curl 
COPY ./integration.sh ./
RUN chmod +x ./integration.sh
CMD ["sleep", "100000"]
