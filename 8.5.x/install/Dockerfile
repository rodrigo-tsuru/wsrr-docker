FROM rodrigotsuru/wasnd-docker:8.5.5
MAINTAINER Rodrigo Tsuru <caixapostal@gmail.com>
#RUN rpm --rebuilddb
#Bug https://docs.oracle.com/cd/E52668_01/E69348/html/uek4-czc_xmc_xt.html
RUN touch /var/lib/rpm/*
RUN rpm --rebuilddb; yum install -y yum-plugin-ovl
RUN yum install -y unzip \
libaio.i686 \
libaio.x86_64  \
pam.i686 \
pam.x86_64 \
libstdc++.i686 \
libstdc++.x86_64 \
compat-libstdc++-33.i686 \
compat-libstdc++-33.x86_64 \
glibc.i686 \
glibc.x86_64 \
libgcc.i686 \
libgcc.x86_64 \
sg3_utils \
kernel-devel \
gcc-c++ \
wget \
file \
ksh.x86_64 \
patch \
ntpd \
gcc \
python-setuptools
RUN easy_install supervisor
COPY configs/supervisord.conf /etc/supervisord.conf
ADD install-package /tmp/install-package
COPY install.xml /tmp/install.xml
RUN /opt/IBM/InstallationManager/eclipse/tools/imcl input /tmp/install.xml -acceptLicense -showProgress -masterPasswordFile /tmp/masterpw.txt -secureStorageFile /tmp/secure.dat && \
rm -Rf /tmp/install-package
