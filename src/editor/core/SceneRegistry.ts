/**
 * Scene Registry — bidirectional map between entity IDs and Babylon meshes.
 *
 * This is a CORE foundation piece:
 *   Babylon pick result → mesh → SceneRegistry lookup → entity ID → selection store update
 *
 * Without this registry, selection and sync become unmanageable.
 */

import type { TransformNode, AbstractMesh } from '@babylonjs/core';

class SceneRegistryClass {
  private entityToNode = new Map<string, TransformNode>();
  private meshToEntity = new Map<string, string>();

  /** Register an entity's root transform node */
  register(entityId: string, node: TransformNode): void {
    this.entityToNode.set(entityId, node);
    // Also store entityId in node metadata for quick access
    node.metadata = { ...node.metadata, entityId };
  }

  /** Register a child visual mesh so picking it resolves to the parent entity */
  registerMeshPick(mesh: AbstractMesh, entityId: string): void {
    this.meshToEntity.set(mesh.uniqueId.toString(), entityId);
  }

  /** Remove a mapping by entity ID */
  unregister(entityId: string): void {
    this.entityToNode.delete(entityId);
  }

  /** Unregister a child visual mesh from picking */
  unregisterMeshPick(mesh: AbstractMesh): void {
     this.meshToEntity.delete(mesh.uniqueId.toString());
  }

  /** Get the root TransformNode by entity ID */
  getNode(entityId: string): TransformNode | undefined {
    return this.entityToNode.get(entityId);
  }

  /** Get entity ID by a picked child mesh */
  getEntityId(mesh: AbstractMesh): string | undefined {
    return this.meshToEntity.get(mesh.uniqueId.toString());
  }

  /** Check if an entity is registered */
  has(entityId: string): boolean {
    return this.entityToNode.has(entityId);
  }

  /** Get all registered entity IDs */
  getAllEntityIds(): string[] {
    return Array.from(this.entityToNode.keys());
  }

  /** Clear all registrations */
  clear(): void {
    this.entityToNode.clear();
    this.meshToEntity.clear();
  }
}

/** Singleton instance */
export const SceneRegistry = new SceneRegistryClass();
