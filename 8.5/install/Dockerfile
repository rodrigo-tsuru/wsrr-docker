FROM rodrigotsuru/wasnd-docker:8.5.5
MAINTAINER Rodrigo Tsuru <caixapostal@gmail.com>
RUN yum install -y curl \
unzip 
RUN cd /tmp && curl -O -L https://googledrive.com/host/0B1TfHhOuw5TLMWw2YkNITVhWWjQ/WEBSPHERE_SERVICE_REGISTRY_AND_RE.zip
RUN cd /tmp && \
unzip WEBSPHERE_SERVICE_REGISTRY_AND_RE.zip -d /tmp/wsrr && \
rm WEBSPHERE_SERVICE_REGISTRY_AND_RE.zip
COPY install.xml /tmp/install.xml
RUN cd /tmp/wsrr && \
/opt/IBM/InstallationManager/eclipse/tools/imcl input /tmp/install.xml -acceptLicense -showProgress -masterPasswordFile /tmp/masterpw.txt -secureStorageFile /tmp/secure.dat && \
rm -Rf /tmp/wsrr 
