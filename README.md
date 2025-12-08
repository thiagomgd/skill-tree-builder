# Skill Tree Builder

Trying React Flow for a skill tree builder

React + Typescript + Vite

## Instructions

Install dependencies with `npm i`.

To run dev: `npm run dev`. It'll be available at http://localhost:5173/

To test with jest: `npm run test`

## Notes

Basic interactive skill tree builder, with cycle prevention.

Cursor used during planning and execution of app + tests.

### To-Do

Things that would be interesting to implement or improve as follow-up:

1. Responsive design
2. Cost-per level
3. track current vs max level, lvl up with a click instead of edit
4. Dependency based on min. level of previous skills
5. Detect collision (https://reactflow.dev/examples/layout/node-collisions)
6. Ensure nodes are always created on visible area
7. Toast instead of alert for notifications
8. Delete Middle Node (https://reactflow.dev/examples/nodes/delete-middle-node)
9. Add elk and button to auto-set the layout (https://reactflow.dev/examples/layout/elkjs)
10. Search and Filter nodes
