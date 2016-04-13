
Error.stackTraceLimit = Infinity;

const e2eContext = require.context('./e2e', true, /(.*)\.js$/);
e2eContext.keys().forEach(e2eContext);
