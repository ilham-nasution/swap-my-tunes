import { StartServer, createStartHandler } from '@tanstack/start/server';
import { createRouter } from './router';

export default createStartHandler({
  createRouter,
  render: ({ router }) => <StartServer router={router} />,
});
