# Debian Linux with OpenJDK
FROM openjdk:8

# install required packages
RUN apt-get update && apt-get upgrade -y
RUN apt-get install -y bash git make gcc libreadline-dev libbsd-dev

# install rosie
RUN git clone https://gitlab.com/rosie-pattern-language/rosie.git
RUN cd rosie && make && make install
RUN rm -rf rosie

# copy WAR into image
COPY rosie-101-runner.jar /rosie-101.jar

# run application with this command line
CMD export LD_LIBRARY_PATH=/usr/local/lib && java -jar /rosie-101.jar
