import { Edge, Handle, Node, NodeProps, Position as HandlePosition } from "reactflow";
import useLogicStore from "../store";

type CircuitData = {
  name: string
  nodes: Node[]
  edges: Edge[]
  inputs: { [key: string]: boolean }
  outputs: { [key: string]: boolean }
}

type LogicCircuitNode = Node<CircuitData>;

export default function LogicCircuitNode({id, data} : NodeProps<CircuitData>){
  const setSelectedNode = useLogicStore((state) => state.setSelectedNode);

  function height(){
    const calculatedHeight = Math.max(Object.keys(data.inputs).length, Object.keys(data.outputs).length) * 22
    const minHeight = 40;
    const height = calculatedHeight > minHeight? calculatedHeight : minHeight
    return  height + "px";
  }

  function handleSelect(){
    setSelectedNode(id)
  }

  return (
    <div onClick={handleSelect} className={"bg-transparent border-2 border-white p-2 text-gray-500 rounded relative text-center hover:bg-white hover:bg-opacity-10"} style={{height: height()}}>
      <div className="h-full w-full flex justify-center items-center">
        <h1 className="pointer-events-none">{data.name}</h1>
      </div>
      <div className="absolute flex flex-col h-full justify-center items-center space-y-2 top-0 left-0 pointer-events-none">
        {Object.keys(data.inputs).map((inputNodeId, index) => (
          <div key={index} className="pointer-events-none">
            <Handle id={inputNodeId} type="target" position={HandlePosition.Left} style={{position: "relative"}} className={data.inputs[inputNodeId]? "bg-green-400" : "bg-red-400"}/>
          </div>
        ))}
      </div>
      <div className="absolute flex flex-col h-full justify-center items-center space-y-2 top-0 right-0 pointer-events-none">
        {Object.keys(data.outputs).map((outputNodeId, index) => (
          <div key={index} className="pointer-events-none">
            <Handle id={outputNodeId} type="source" position={HandlePosition.Right} style={{position: "relative"}} className={data.outputs[outputNodeId]? "bg-green-400" : "bg-red-400"}/>
          </div>
        ))}
      </div>
    </div>
  )
}