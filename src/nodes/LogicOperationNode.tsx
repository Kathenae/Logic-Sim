import { Handle, Node, NodeProps, Position } from "reactflow";
import useLogicStore from "../store";

export enum LogicOperation{
  AND = 'AND',
  OR = 'OR',
  NOT = 'NOT',
  XOR = 'XOR',
  NAND = 'NAND',
  NOR = 'NOR'
}

export function evaluate(type : LogicOperation, input1 : boolean, input2 : boolean){
  switch(type){
    case LogicOperation.AND:
      return input1 && input2
    case LogicOperation.OR:
      return input1 || input2
    case LogicOperation.NOT:
      return !input1;
    case LogicOperation.XOR:
      return input1 !== input2
    case LogicOperation.NAND:
      return !(input1 && input2)
    case LogicOperation.NOR:
      return !(input1 || input2)
  }
}

type LogicOperationData = {
  operationType: LogicOperation
  input1: boolean;
  input2: boolean;
  output: boolean;
}

type LogicOperationNode = Node<LogicOperationData>;

export default function LogicOperationNode({id, data} : NodeProps<LogicOperationData>){
  const setSelectedNode = useLogicStore((state) => state.setSelectedNode);

  const handleSelect = () => {
    setSelectedNode(id)
    console.log(id)
  }

  return (
    <div onClick={handleSelect} className={"border-2 border-white p-2 text-gray-500 rounded relative text-center " + (data.output? "bg-green-400" : "bg-transparent")}>
      <h1 className="pointer-events-none">{data.operationType}</h1>
      <div className={"absolute left-0 pointer-events-none " + (data.operationType != LogicOperation.NOT? "!top-[25%]" : "!top-[50%]")}>
        <Handle id="input1" type="target" position={Position.Left} className={data.input1? "bg-green-400" : "bg-red-400"}/>
      </div>
      {
        data.operationType != LogicOperation.NOT && 
        (
          <div className="absolute !bottom-[25%] left-0 pointer-events-none">
            <Handle id="input2" type="target" position={Position.Left} className={data.input2? "bg-green-400" : "bg-red-400"}/>
          </div>
        )
      }
      <Handle id="output" type="source" position={Position.Right} className={data.output ? "bg-green-400" : "bg-red-400"}/>
    </div>
  )
}