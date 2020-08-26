# MiniVideoEncoder
![WorkflowEngine Build and Publish to Docker](https://github.com/PatrickKalkman/MiniVideoEncoder/workflows/WorkflowEngine%20Build%20and%20Publish%20to%20Docker/badge.svg)
![WorkflowEncoder Build and Publish to Docker](https://github.com/PatrickKalkman/MiniVideoEncoder/workflows/WorkflowEncoder%20Build%20and%20Publish%20to%20Docker/badge.svg)

Mini Video Encoder (MVE) is a modern video encoding platform based on open-source tools and frameworks.

MVE is
- Scalable and portable
- Open-source
- Optimized for streaming, support multiple authoring specifications
- Support modern video and audio encodings (x264, x265, VP9, AV1)
- Support delivery via MPEG-DASH, HLS and Smooth Streaming)
- Support major DRMs (Google Widevine, Apple Fairplay, Microsoft PlayReady)

# Installation instructions
//TODO

# Development instructions
MVE consists of the following 4 required services and are stored in a separate folder:
- WorkflowDatabase
- WorkflowEngine
- WorkflowEncoder
- WorkflowPackager

## WorkflowDatabase
The workflow database stores the state of the encoding jobs. MVE uses a MongoDB database.

For local development, the database can be started by executing ```docker-compose up``` in a terminal window in the WorkflowDatabase folder.

![Screenshot starting workflow database](https://raw.githubusercontent.com/PatrickKalkman/MiniVideoEncoder/master/docs/starting%20workflowdatabase.png)

## WorkflowEngine
The workflow engine is responsible for handling the incoming encoding jobs. It implements a REST api for receiving new jobs and requesting the status of encoding jobs.

For local development, the workflow engine can be installed and started by first executing ```npm install``` to install all dependencies and ```npm start``` to start the engine.

![Screenshot starting workflow engine](https://raw.githubusercontent.com/PatrickKalkman/MiniVideoEncoder/master/docs/starting%20workflowengine.png)

## WorkflowEncoder
The workflow encoder is responsible for actually encoding the input video to the requested formats. Currently the encoder supports x264, x265 and VP9. The workflow encoder uses ffmpeg for encoding.

For local development, the workflow encoder can be installed and started by first executing ```npm install``` to install all dependencies and ```npm start``` to start the encoder.

![Screenshot starting workflow encoder](https://raw.githubusercontent.com/PatrickKalkman/MiniVideoEncoder/master/docs/starting%20workflowencoder.png)

## WorkflowPackager
The workflow packager is responsible for packaging the encoded content. It can converts the multiple encoded output streams into an HLS or Dash package. The packager is also responsible for adding the optional DRM to the package.

For local development, the workflow packager can be installed and started by first executing ```npm install``` to install all dependencies and ```npm start``` to start the packager.

![Screenshot starting workflow packager](https://raw.githubusercontent.com/PatrickKalkman/MiniVideoEncoder/master/docs/starting%20workflowpackager.png)

## Additional tools I use for development

I use two additional tools for local development, [Postman](https://www.postman.com/) and [MongoDb Compass Community](https://www.mongodb.com/try/download/compass).

I use Postman to use and test the REST API of the workflow enging. To be able to query the database, I use MongoDB Compass. Both are available for free.  
