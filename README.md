# Rosie 101

This project is a simple Bluemix application which uses [`librosie`](https://github.com/jamiejennings/rosie-pattern-language) via its [Java binding](https://github.com/antoniomacri/rosie-pattern-language-java).

**Warning.** Rosie library currently does not build on Windows. Therefore, development and testing must be done on Linux (Ubuntu 17.04 is fine) or Mac OS.


## Building and running the application

This project can be built with [Apache Maven](http://maven.apache.org/). The project uses [Liberty Maven Plug-in](https://github.com/WASdev/ci.maven) to automatically download and install Liberty from the [Liberty repository](https://developer.ibm.com/wasdev/downloads/). Liberty Maven Plug-in is also used to create, configure, and run the application on the Liberty server. 

Use the following steps to run the application locally:

1. Execute full Maven build to create the target WAR file:

    ```bash
    $ mvn clean install
    ```

2. Use the Liberty Maven plugin to run the built application:

    ```bash
    $ mvn liberty:run-server
    ```

    Once the server is running, the application will be available under <http://localhost:9080>.

To deploy and run the built application in Bluemix, an account is needed. Navigate to <https://idaas.iam.ibm.com> and login if you already have an IBM Cloud account or register first.

Then, create an application from the "CloudFoundry Apps" page:

 * Click on the "CloudFoundry Apps" menu item on the left (which points to something like <https://console-regional.eu-gb.bluemix.net/dashboard/cf-apps>)
 * Click on the "Create resource" button
 * Select "Liberty for Java"
 * Insert "rosie-101" as application name an proceed.

On the local project, move the current directory where the file `manifest.yml` is located (i.e., `rosie-101-web`) and type the following commands:

```bash
$ cf api https://api.<domain>.bluemix.net
$ cf auth user@name.com password
$ cf target -o user@name.com -s dev
```

To deploy a new package to Bluemix, rebuild the project and type (in the same folder where `manifest.yml` is located):

```bash
$ cf push
```
