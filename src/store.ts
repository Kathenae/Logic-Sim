import { nanoid } from 'nanoid';
import { create } from 'zustand';
import { LogicOperation, evaluate } from './nodes/LogicOperationNode';
import { Connection, Edge, EdgeChange, Node, NodeChange, XYPosition, addEdge, applyEdgeChanges, applyNodeChanges } from 'reactflow';
import { NodeType } from './nodeDefinitions';

// const nodes = [
//   {
//     id: nanoid(),
//     type: 'logic-input',
//     data: { output: true },
//     position: { x: 0, y: 50 },
//   },
//   {
//     id: nanoid(),
//     type: 'logic-input',
//     data: { output: false },
//     position: { x: 0, y: -50 },
//   },
//   {
//     id: nanoid(),
//     type: 'logic-operation',
//     data: { type: LogicOperation.AND, input1: false, input2: false, output: false },
//     position: { x: 400, y: -100 },
//   },
//   {
//     id: nanoid(),
//     type: 'logic-operation',
//     data: { type: LogicOperation.AND, input1: false, input2: false, output: false },
//     position: { x: 400, y: 100 },
//   },
//   {
//     id: nanoid(),
//     type: 'logic-operation',
//     data: { type: LogicOperation.OR, input1: false, input2: false, output: false },
//     position: { x: 400, y: 0 },
//   },
// ];

export type Circuit = {
  name: string
  nodes: Node[]
  edges: Edge[]
}

interface LogicState {
  nodes: Node[]
  edges: Edge[]
  circuits: Circuit[]
  selectedNode: string
  onNodesChange: (changes: NodeChange[]) => void
  onEdgesChange: (changes: EdgeChange[]) => void
  onConnect: (connection: Connection) => void
  placeBasicNode: (createInfo: NodePlacementInfo) => void
  placeCircuitNode: (circuit: Circuit, position: XYPosition) => void
  toggleInputNode: (nodeId: string) => void
  saveCircuit: (circuit: Circuit) => void
  clear: () => void
  setSelectedNode: (nodeId: string) => void
  deleteSelectedNode: () => void
}

export type NodePlacementInfo = {
  nodeType: NodeType;
  operationType: LogicOperation | undefined;
  position: XYPosition
};

const useLogicStore = create<LogicState>((set, get) => ({
  nodes: [],
  edges: [],
  circuits: [],
  selectedNode: '',
  onNodesChange: (changes: NodeChange[]) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes)
    });
  },
  onEdgesChange: (changes: EdgeChange[]) => {
    set({
      edges: applyEdgeChanges(changes, get().edges)
    });
  },
  onConnect: (connection: Connection) => {
    set({
      edges: addEdge({ ...connection }, get().edges),
    });

    simulateGraph(set, get);
  },
  placeBasicNode: (createInfo: NodePlacementInfo) => {
    const newNode = {
      id: nanoid(),
      type: createInfo.nodeType,
      data: {},
      position: createInfo.position,
    };

    if (createInfo.nodeType == NodeType.Input) {
      newNode.data = { output: false };
    }

    if (createInfo.nodeType == NodeType.Logic) {
      newNode.data = { operationType: createInfo.operationType, input1: false, input2: false, output: false }
    }

    // add new node to the circuit
    set({
      nodes: [...get().nodes, newNode],
    })

    simulateGraph(set, get);
  },
  placeCircuitNode: (circuit: Circuit, position: XYPosition) => {

    // Clone the circuit
    const circuitClone: Circuit = JSON.parse(JSON.stringify(circuit));

    // Lists of inputs and outputs the circuit supports
    const inputs: { [key: string]: boolean } = {};
    const outputs: { [key: string]: boolean } = {};

    const circuitNodeId = nanoid();
    // ids the to be globally unique so we need to update all the ids on the inner nodes
    circuitClone.nodes.forEach(node => {
      node.id = `${node.id}${circuitNodeId}`
    })

    circuitClone.edges.forEach(edge => {
      edge.id = `${edge.id}${circuitNodeId}`
      edge.target = `${edge.target}${circuitNodeId}`;
      edge.source = `${edge.source}${circuitNodeId}`;
    });

    circuitClone.nodes.forEach(node => {
      if (node.type == NodeType.Input) {
        inputs[node.id] = false;
      }
      else if (node.type == NodeType.Output) {
        outputs[node.id] = false;
      }
    })

    // Create the circuit node
    const circuitNode = {
      id: circuitNodeId,
      type: NodeType.Circuit,
      data: { ...circuitClone, inputs, outputs },
      position,
    }

    // add the circuit to the graph
    set({
      nodes: [...get().nodes, circuitNode],
    })

    simulateGraph(set, get);
  },
  toggleInputNode: (nodeId: string) => {
    set({
      nodes: get().nodes.map(node => {
        const data = { ...node.data }

        if (node.id == nodeId) {
          data.output = !data.output
        }

        node.data = data
        return node;
      })
    })

    simulateGraph(set, get);
  },
  saveCircuit: (circuit: Circuit) => {
    set({
      circuits: [...get().circuits, circuit]
    })
  },
  clear: () => {
    set({
      nodes: [],
      edges: []
    })
  },
  setSelectedNode: (id: string) => {
    set({
      selectedNode: id
    })
  },
  deleteSelectedNode: () => {
    const id = get().selectedNode;
    set({
      nodes: get().nodes.filter(node => node.id != id),
      edges: get().edges.filter(edge => edge.source != id && edge.target != id)
    })
  }
}))

function simulateGraph(set: (partial: LogicState | Partial<LogicState> | ((state: LogicState) => LogicState | Partial<LogicState>), replace?: boolean | undefined) => void, get: () => LogicState) {
  const nodes = get().nodes;
  const edges = get().edges;


  const distributedInputs = {};
  const inputNodes = nodes.filter(n => n.type == NodeType.Input);

  // Starting from the input nodes, recursively distribute them
  inputNodes.forEach(inputNode => {
    simulateRecursive(inputNode, nodes, edges, distributedInputs);
  })

  function simulateRecursive(node: Node, nodes: Node[], edges: Edge[], distributedInputs: any) {
    const outgoingEdges = edges.filter(edge => edge.source == node.id);

    outgoingEdges.forEach(edge => {
      const targetNode = nodes.find(n => n.id == edge.target)

      if (targetNode != null) {

        let inputValue = node.data[edge.sourceHandle as string]
        if (node.type == NodeType.Circuit) {
          inputValue = node.data.outputs[edge.sourceHandle as string]
        }

        const data = { ...targetNode.data }

        if (targetNode.type != NodeType.Circuit) {
          data[edge.targetHandle as string] = inputValue
          targetNode.data = data;
        }
        else {
          // update input data
          data.inputs[edge.targetHandle as string] = inputValue
          targetNode.data = data;

          // find the input node inside the circuit that where the id is equal to the targeted handle and update its output value
          const foundNode = targetNode.data.nodes.find((node: Node) => node.id == edge.targetHandle)
          foundNode.data = { output: inputValue };
        }


        if ((targetNode.id in distributedInputs) == false) {
          distributedInputs[targetNode.id as string] = []
        }

        // set the input distributed/received
        distributedInputs[targetNode.id].push(edge.targetHandle);

        // check if this node has received all its inputs and evaluate the logic if it has
        if (distributedInputs[targetNode.id].length == edges.filter(edge => edge.target == targetNode.id).length) {

          if (targetNode.type == NodeType.Logic) {
            data.output = evaluate(data.operationType, data.input1, data.input2)
            targetNode.data = data;
          }
          else if (targetNode.type == NodeType.Circuit) {
            const circuitInputs: Node[] = targetNode.data.nodes.filter((n: Node) => n.type == NodeType.Input)
            const internalDistributedInputs = {};
            circuitInputs.forEach((node: Node) => {
              simulateRecursive(node, targetNode.data.nodes, targetNode.data.edges, internalDistributedInputs)
            })

            // after simulating the internal circuit, update the output data of the circuit
            Object.keys(targetNode.data.outputs).map(outputNodeId => {
              const node = targetNode.data.nodes.find((n: Node) => n.id == outputNodeId);
              targetNode.data.outputs[outputNodeId] = node.data.output
            })
          }

          // Make this node distribute its input aswell
          simulateRecursive(targetNode, nodes, edges, distributedInputs);
        }
      }
    })
  }

  // Refresh the nodes on the graph
  set({
    nodes: [...nodes]
  });
}

export default useLogicStore