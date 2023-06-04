import { Handle, Node, NodeProps, Position } from "reactflow";
import useLogicStore from "../store";

type LogicOutputData = {
  output: boolean
}

type LogicOutputNode = Node<LogicOutputData>;

export default function LogicOutputNode({id, data} : NodeProps<LogicOutputData>){
  const setSelectedNode = useLogicStore((state) => state.setSelectedNode);
  return (
    <div onClick={(event) => setSelectedNode(id)} className={"border-2 border-indigo-500  border-white p-2 text-gray-500 rounded rounded-r-3xl w-14 text-center " + (data.output? "bg-green-400" : "bg-transparent ")}>
      <h1 className="pointer-events-none">{data.output? "ON" : "OFF"}</h1>
      <Handle id="output" type="target" position={Position.Left} className={data.output? "bg-green-400" : "bg-red-400"}/>
    </div>
  )
}