FROM rodrigotsuru/wsrr-docker:8.5
MAINTAINER Rodrigo Tsuru <caixapostal@gmail.com>
COPY create-db2-standalone-singledb.txt /tmp/create-db2-standalone-singledb.txt
RUN /opt/IBM/WebSphere/AppServer/bin/manageprofiles.sh -response /tmp/create-db2-standalone-singledb.txt
