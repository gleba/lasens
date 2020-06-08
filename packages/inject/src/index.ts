export interface IDependency {}

export function addDependency(key:string, target:any){
  di[key] = target
}

const di:IDependency = {}

export default di

