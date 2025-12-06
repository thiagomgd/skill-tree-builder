# Skill Tree Builder

Trying React Flow for a skill tree builder

React + Typescript + Vite

## Instructions

Install dependencies with `npm i`.

To run dev: `npm run dev`. It'll be available at http://localhost:5173/

To test with jest: `npm run test`

## Notes

Basic interactive skill tree builder, with cycle prevention.

### To-Do

Things that would be interesting to implement or improve as follow-up:

1. Cost-per level
2. track current vs max level, lvl up with a click instead of edit
3. Dependency based on min. level of previous skills
4. Detect collision (https://reactflow.dev/examples/layout/node-collisions)
5. Ensure nodes are always created on visible area
6. Toast instead of alert for notifications
7. Delete Middle Node (https://reactflow.dev/examples/nodes/delete-middle-node)
8. Add elk and button to auto-set the layout (https://reactflow.dev/examples/layout/elkjs)
9. Search and Filter nodes
