const { FaaSStarter } = require('@midwayjs/faas');
const { asyncWrapper, start } = require('C:\Users\归去来兮\AppData\Roaming\npm\node_modules\@midwayjs\faas-cli\node_modules\@midwayjs\serverless-fc-starter\dist\index.js');


let starter;
let runtime;
let inited = false;

const initializeMethod = async (initializeContext = {}) => {
  runtime = await start({
    layers: []
  });
  starter = new FaaSStarter({ baseDir: __dirname, initializeContext });
  
  await starter.start();
  inited = true;
};

exports.initializer = asyncWrapper(async (...args) => {
  await initializeMethod(...args);
});


exports.handler = asyncWrapper(async (...args) => {
  if (!inited) {
    await initializeMethod();
  }
  
  return runtime.asyncEvent(starter.handleInvokeWrapper('index.handler'))(...args);
  
});
