import ReactFlow, { Background, BackgroundVariant, ConnectionLineType, Controls } from 'reactflow';

import 'reactflow/dist/base.css';
import ActionPane from './components/ActionPane';
import useLogicStore from './store';
import LogicCircuitNode from "./nodes/LogicCircuitNode";
import LogicInputNode from "./nodes/LogicInputNode";
import LogicOperationNode from "./nodes/LogicOperationNode";
import LogicOutputNode from "./nodes/LogicOutputNode";

export const nodeTypes = {
  "logic-input" : LogicInputNode,
  'logic-output' : LogicOutputNode,
  "logic-operation" : LogicOperationNode,
  "logic-circuit" : LogicCircuitNode,
}

export default function App() {
  const logicState = useLogicStore();
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <ReactFlow 
        nodeTypes={nodeTypes} 
        nodes={logicState.nodes} 
        edges={logicState.edges}
        onNodesChange={logicState.onNodesChange}
        onEdgesChange={logicState.onEdgesChange}
        onConnect={logicState.onConnect}
        connectionLineType={ConnectionLineType.Bezier}
        snapToGrid
        snapGrid={[25, 25]}
        nodeOrigin={[0.5, 0.5]} >
        <Background variant={BackgroundVariant.Dots}/>
        <Controls /> 
        <ActionPane />
      </ReactFlow>
    </div>
  );
}