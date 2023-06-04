import { useCallback, useState } from "react";
import { LogicOperation } from "../nodes/LogicOperationNode";
import useLogicStore, { Circuit, NodePlacementInfo as NodePlacementInfo } from "../store";
import { NodeType } from "../nodeDefinitions";
import { useReactFlow } from "reactflow";

const btnClass = "bg-white px-2 py-1 text-gray-500 rounded-none text-sm hover:bg-indigo-100 focus:ring-indigo-500";


type NodeButtonProps = {
  children: any,
  nodetype: NodeType,
  operationType?: LogicOperation,
  onDragStart: (createInfo : NodePlacementInfo) => void
}

function NodeButton(props : NodeButtonProps){ 
  
  function handleDragStart(event : any){
    props.onDragStart({
      nodeType: props.nodetype,
      operationType: props.operationType,
      position: {x: 0, y: 0},
    })
  }

  return (
    <button draggable className={btnClass} onDragStart={handleDragStart}>{props.children}</button>
  )
}

export default function ActionPane(){
  const reactflow = useReactFlow();
  const logicState = useLogicStore();

  const [nodePlacementInfo, setNodeCreateInfo] = useState<NodePlacementInfo>()
  const [selectedCircuit, setSelectedCircuit] = useState<Circuit>()
  const [nameInput, setNameInput] = useState<string>('LOGIC');
  const placeNode = useLogicStore((state) => state.placeBasicNode)
  const placeCircuitNode = useLogicStore((state) => state.placeCircuitNode)

  document.ondragend = (evt) => {
    // Handle node placement
    if(nodePlacementInfo){
      nodePlacementInfo.position = reactflow.project({x: evt.clientX, y: evt.clientY});

      if(nodePlacementInfo.nodeType != NodeType.Circuit){
        placeNode(nodePlacementInfo)
      }
      else if(selectedCircuit != null){
        placeCircuitNode(selectedCircuit, nodePlacementInfo.position)
      }
    }
  }

  function handleDragStart(draggedButtonInfo : NodePlacementInfo){
    setNodeCreateInfo(draggedButtonInfo);
  }

  function handleSave(){
    
    if(nameInput == null){
      return;
    }

    logicState.saveCircuit({
      name: nameInput,
      nodes: [...logicState.nodes],
      edges: [...logicState.edges]
    })
  }

  function handleDelete(){
    logicState.deleteSelectedNode()
  }

  function handleClear(){
    logicState.clear()
  }

  return (
    <div className='p-3 z-20 w-full absolute flex justify-between'>
      <div className="overflow-x-scroll w-150 flex fancyScrollbar">
        <NodeButton nodetype={NodeType.Input} onDragStart={handleDragStart}>IN</NodeButton>
        <NodeButton nodetype={NodeType.Output} onDragStart={handleDragStart}>OUT</NodeButton>
        <NodeButton nodetype={NodeType.Logic} operationType={LogicOperation.NOT} onDragStart={handleDragStart}>NOT</NodeButton>
        <NodeButton nodetype={NodeType.Logic} operationType={LogicOperation.AND} onDragStart={handleDragStart}>AND</NodeButton>
        <NodeButton nodetype={NodeType.Logic} operationType={LogicOperation.NAND} onDragStart={handleDragStart}>NAND</NodeButton>
        <NodeButton nodetype={NodeType.Logic} operationType={LogicOperation.OR} onDragStart={handleDragStart}>OR</NodeButton>
        <NodeButton nodetype={NodeType.Logic} operationType={LogicOperation.XOR} onDragStart={handleDragStart}>XOR</NodeButton>
        <NodeButton nodetype={NodeType.Logic} operationType={LogicOperation.NOR} onDragStart={handleDragStart}>NOR</NodeButton>
        {logicState.circuits.map((circuit, index) => (
          <NodeButton key={index} nodetype={NodeType.Circuit} onDragStart={(createInfo) => {
            setSelectedCircuit(circuit)
            handleDragStart(createInfo);
          }}>{circuit.name}</NodeButton>
        ))}
      </div>
      <div className="space-x-2">
        <button onClick={handleDelete} className={btnClass}>Delete</button>
        <button onClick={handleClear} className={btnClass}>Clear</button>
        <button onClick={handleSave} className={btnClass}>Save</button>
        <input className="p-1 border-2 border-white rounded bg-transparent hover:outline-none text-sm" type="text" name="circuitName" id="" value={nameInput} onChange={(event) => setNameInput(event.target.value)}/>
      </div>
    </div>
  );
}