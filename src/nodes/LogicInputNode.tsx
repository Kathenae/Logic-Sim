import { Handle, Node, NodeProps, Position } from "reactflow";
import useLogicStore from "../store";

type LoginInputData = {
  output: boolean
}

type LogicInputNode = Node<LoginInputData>;

export default function LogicInputNode({id, data} : NodeProps<LoginInputData>){
  const toggleInputNode = useLogicStore((state) => state.toggleInputNode);
  const setSelectedNode = useLogicStore((state) => state.setSelectedNode);

  const handleClick = (event : any) => {
    setSelectedNode(id);
    toggleInputNode(id);
  }

  return (
    <div className={"border-2 border-green-200 p-2 text-gray-500 rounded rounded-l-3xl w-14 text-center " + (data.output? "bg-green-400 hover:bg-opacity-50 text-white" : "bg-transparent hover:bg-white hover:bg-opacity-10")} onClick={handleClick}>
      <h1 className="pointer-events-none">{data.output? "ON" : "OFF"}</h1>
      <Handle id="output" type="source" position={Position.Right} className={data.output? "bg-green-400" : "bg-red-400"}/>
    </div>
  )
}