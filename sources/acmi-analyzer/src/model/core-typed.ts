import { Logger } from '@nestjs/common'

import { Node, Content, Edge } from './core'

const logger = new Logger('core-typed')

export class TypedNode<Payload> extends Node {

  constructor(id: string, payload: Payload, transformerName: string, typeName: string) {
    super(id, new Content(typeName, transformerName, payload))
  }

  public getNodes<NodeType extends Node>(type: Type<NodeType>): NodeType[] {
    return this.nodes
      .filter(node => node.content.type === type.name)
      .map(node => node as NodeType)
  }

  public findNodeWithNameInPayload<NodeType extends Node>(type: Type<NodeType>, name: string): NodeType {
    const node = this.nodes
      .find(node => node.content.type === type.name && node.content.payload.name === name)
    if (node) {
      return node as NodeType
    }
    return undefined
  }

  public addOrExtendNamedNode<NodeType extends TypedNode<Payload>>(
    type: TypeExtendsTypedNode<NodeType, Payload>, name: string, extraPayload: any = {}, transformerName?: string): NodeType {

    const existingNode = this.findNodeWithNameInPayload<NodeType>(type, name)
    if (existingNode) {
      if (extraPayload) {
        Object.getOwnPropertyNames(extraPayload)
          .forEach(payloadPropertyName => existingNode.content.payload[payloadPropertyName] = extraPayload[payloadPropertyName])
      }
      return existingNode
    }

    const node = new type(this.id + '__' + type.name + '_' + name, { name, ...extraPayload }, transformerName,
      // keep type name as last parameter because classes inheriting from TypedNode omit the type name
      // in their own constructors.
      type.name)
    if (node.content.type !== type.name) {
      logger.error('created node of type ' + type.name + ' but type was not set in content.')
    }
    this.nodes.push(node)
    return node
  }

  public getEdges<EdgeType extends Edge>(type: Type<EdgeType>): EdgeType[] {
    return this.edges
      .filter(edge => edge.content.type === type.name)
      .map(edge => edge as EdgeType)
  }

  public getPayload(): Payload {
    return this.content.payload as Payload
  }
}

export function createEdge<Payload>(
  payloadType: Type<Payload>, source: Node, target: Node, payload?: Payload, transformer?: string
): TypedEdge<Payload> {
  return new TypedEdge<Payload>(source, target, payload, transformer, payloadType.name)
}

export class TypedEdge<Payload> extends Edge {

  constructor(source: Node, target: Node, payload: Payload, transformerName: string, typeName: string) {
    super(source, target, new Content(typeName, transformerName, payload))
  }

  public getPayload(): Payload {
    return this.content.payload as Payload
  }
}

interface Type<T> extends Function {
  new(...args: any[]): T
}

interface TypeExtendsTypedNode<Type, Payload> extends Function {
  new(id: string, payload: Payload, typeName: string, transformerName: string): Type
}