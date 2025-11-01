import { GAME_CONFIG } from '../config';
import type { MapManager } from '../managers/MapManager';
import { GhostState, GhostType } from '../types';
import type { TilePosition } from '../types';
import { pixelToTile, tileToPixelCentered } from '../utils/helpers';
import { findPath, getNeighbors } from '../utils/pathfinding';
import type { Pacman } from './Pacman';
import * as Phaser from 'phaser';

export class Ghost {
  private scene: Phaser.Scene;
  private mapManager: MapManager;
  public sprite: Phaser.GameObjects.Sprite;
  public body: Phaser.Physics.Arcade.Body;
  public type: GhostType;
  public position: TilePosition;
  public state: GhostState = GhostState.SCATTER;
  private homePosition: TilePosition;
  private speed: number = GAME_CONFIG.GHOST_SPEED;
  private stateTimer: Phaser.Time.TimerEvent | null = null;
  private mapOffset: { x: number; y: number };
  private lastDirection: TilePosition | null = null; // Track current direction
  private lastTile: TilePosition | null = null; // Track last tile position
  private frightenedTarget: TilePosition | null = null; // Target tile when frightened
  private moveTimer: number = 0; // Frames until next move
  private normalTexture: string; // Store normal texture key

  constructor(
    scene: Phaser.Scene,
    mapManager: MapManager,
    type: GhostType,
    position: TilePosition
  ) {
    this.scene = scene;
    this.mapManager = mapManager;
    this.type = type;
    this.position = position;

    // Get map offset for proper positioning
    this.mapOffset = mapManager.getMapOffset();

    // Get texture key based on ghost type
    this.normalTexture = this.getTextureKey(type);

    // Create ghost sprite
    const pos = tileToPixelCentered(position.row, position.col);
    this.sprite = scene.add.sprite(
      pos.x + this.mapOffset.x,
      pos.y + this.mapOffset.y,
      this.normalTexture
    );
    this.sprite.setDisplaySize(
      GAME_CONFIG.TILE_SIZE - 4,
      GAME_CONFIG.TILE_SIZE - 4
    );

    // Enable physics on Ghost
    scene.physics.add.existing(this.sprite);
    this.body = this.sprite.body as Phaser.Physics.Arcade.Body;
    this.body.setCircle(GAME_CONFIG.TILE_SIZE / 2 - 2);

    // Store home position (convert from screen space to map space)
    this.homePosition = position;

    // Start state cycling
    this.startStateCycling();
  }

  /**
   * Get texture key based on ghost type
   */
  private getTextureKey(type: GhostType): string {
    switch (type) {
      case GhostType.BLINKY:
        return 'blinky';
      case GhostType.PINKY:
        return 'pinky';
      case GhostType.INKY:
        return 'inky';
      case GhostType.CLYDE:
        return 'clyde';
      default:
        return 'blinky';
    }
  }

  /**
   * Start cycling between CHASE and SCATTER states
   */
  private startStateCycling(): void {
    this.setState(GhostState.SCATTER);

    this.stateTimer = this.scene.time.addEvent({
      delay: GAME_CONFIG.GHOST_SCATTER_TIME,
      callback: () => {
        if (this.state === GhostState.SCATTER) {
          this.setState(GhostState.CHASE);
        } else if (this.state === GhostState.CHASE) {
          this.setState(GhostState.SCATTER);
        }
      },
      loop: true,
    });
  }

  /**
   * Set ghost state
   */
  setState(state: GhostState): void {
    this.state = state;

    // Reset direction tracking when changing states
    if (state === GhostState.FRIGHTENED) {
      // Keep current direction when entering frightened state
      // but reset tile tracking to pick new direction immediately
      this.lastTile = null;
      this.frightenedTarget = null;
    } else {
      // Reset all tracking when exiting frightened state
      this.lastDirection = null;
      this.lastTile = null;
      this.frightenedTarget = null;
    }

    switch (state) {
      case GhostState.CHASE:
      case GhostState.SCATTER:
        this.speed = GAME_CONFIG.GHOST_SPEED;
        this.sprite.setTexture(this.normalTexture);
        this.sprite.setAlpha(1);
        break;

      case GhostState.FRIGHTENED:
        this.speed = GAME_CONFIG.GHOST_FRIGHTENED_SPEED;
        this.sprite.setTexture('blue_ghost');
        this.sprite.setAlpha(0.7);
        break;

      case GhostState.EATEN:
        this.speed = GAME_CONFIG.GHOST_EATEN_SPEED;
        this.scene.tweens.add({
          targets: this.sprite,
          alpha: { from: 1, to: 0 },
          duration: 500,
          ease: 'Power2',
        });
        break;
    }
  }

  /**
   * Make ghost frightened (power pellet eaten)
   */
  makeFrightened(): void {
    if (this.state !== GhostState.EATEN) {
      this.setState(GhostState.FRIGHTENED);

      // Return to normal after duration
      this.scene.time.delayedCall(GAME_CONFIG.POWER_DURATION, () => {
        if (this.state === GhostState.FRIGHTENED) {
          this.setState(GhostState.SCATTER);
        }
      });
    }
  }

  /**
   * Update ghost AI and movement
   */
  update(pacman: Pacman): void {
    if (this.state === GhostState.EATEN) {
      this.scene.time.delayedCall(1000, () => this.reset(this.homePosition));
      return;
    }

    // Determine target based on state and ghost type
    const pacmanTile = pacman.getTilePosition();
    let target: TilePosition;

    if (this.state === GhostState.FRIGHTENED) {
      // Random movement when frightened - choose direction at intersections
      const currentTile = this.getTilePosition();

      // Pick a new direction when we've entered a new tile (or don't have a target yet)
      if (
        !this.frightenedTarget ||
        !this.lastTile ||
        currentTile.row !== this.lastTile.row ||
        currentTile.col !== this.lastTile.col
      ) {
        const nextTile = this.getFrightenedDirection(currentTile);
        if (nextTile) {
          this.frightenedTarget = nextTile;
          this.lastTile = currentTile;
        } else {
          // Fallback if no valid direction found
          this.frightenedTarget = pacmanTile;
        }
      }

      // Always move towards the frightened target
      target = this.frightenedTarget;
    } else if (this.state === GhostState.CHASE) {
      target = this.getChaseTarget(pacmanTile);
    } else {
      // SCATTER - go to home corner
      target = this.getScatterTarget();
    }

    this.moveTowardsTarget(target);
  }

  /**
   * Get chase target based on ghost personality
   */
  private getChaseTarget(pacmanTile: TilePosition): TilePosition {
    switch (this.type) {
      case GhostType.BLINKY:
        // Directly chase Pacman
        return pacmanTile;

      case GhostType.PINKY:
        // Target 4 tiles ahead of Pacman
        return {
          row: Math.max(0, pacmanTile.row - 4),
          col: pacmanTile.col,
        };

      case GhostType.INKY:
        // Target based on Blinky's position (simplified)
        return {
          row: pacmanTile.row + 2,
          col: pacmanTile.col + 2,
        };

      case GhostType.CLYDE:
        // Chase if far, scatter if close
        const currentTile = this.getTilePosition();
        const distance =
          Math.abs(currentTile.row - pacmanTile.row) +
          Math.abs(currentTile.col - pacmanTile.col);
        return distance > 8 ? pacmanTile : this.getScatterTarget();

      default:
        return pacmanTile;
    }
  }

  /**
   * Get scatter target (home corner)
   */
  private getScatterTarget(): TilePosition {
    const mapData = this.mapManager.getMapData();
    if (!mapData) return this.homePosition;

    switch (this.type) {
      case GhostType.BLINKY:
        return { row: 1, col: mapData.width - 2 };
      case GhostType.PINKY:
        return { row: 1, col: 1 };
      case GhostType.INKY:
        return { row: mapData.height - 2, col: mapData.width - 2 };
      case GhostType.CLYDE:
        return { row: mapData.height - 2, col: 1 };
      default:
        return this.homePosition;
    }
  }

  /**
   * Check if two directions are opposite
   */
  private isOppositeDirection(dir1: TilePosition, dir2: TilePosition): boolean {
    return dir1.row === -dir2.row && dir1.col === -dir2.col;
  }

  /**
   * Get a random direction for frightened ghost
   * Excludes the opposite direction unless it's a dead end
   */
  private getFrightenedDirection(
    currentTile: TilePosition
  ): TilePosition | null {
    const validNeighbors = getNeighbors(
      currentTile,
      this.mapManager.getMapData()!.layout,
      1
    );

    if (validNeighbors.length === 0) return null;

    // If only one direction (dead end), must go back
    if (validNeighbors.length === 1) {
      return validNeighbors[0]!;
    }

    // Filter out the opposite direction if we have a last direction
    let availableNeighbors = validNeighbors;
    if (this.lastDirection) {
      availableNeighbors = validNeighbors.filter((neighbor) => {
        const direction = {
          row: neighbor.row - currentTile.row,
          col: neighbor.col - currentTile.col,
        };
        return !this.isOppositeDirection(direction, this.lastDirection!);
      });
    }

    // If filtering left us with no options (shouldn't happen), use all neighbors
    if (availableNeighbors.length === 0) {
      availableNeighbors = validNeighbors;
    }

    // Pick a random direction from available options
    const randomIndex = Math.floor(Math.random() * availableNeighbors.length);
    return availableNeighbors[randomIndex]!;
  }

  /**
   * Move towards target tile using pathfinding and grid-based movement
   */
  private moveTowardsTarget(target: TilePosition): void {
    const currentTile = this.getTilePosition();
    const mapData = this.mapManager.getMapData();
    if (!mapData) {
      return;
    }

    // Decrement move timer
    this.moveTimer--;

    // Only move when timer reaches 0
    if (this.moveTimer > 0) {
      return;
    }

    // Reset timer for next move
    this.moveTimer = this.speed;

    const nextTile = findPath(currentTile, target, mapData.layout, 1);

    if (nextTile) {
      // Update last direction for frightened movement
      const direction = {
        row: nextTile.row - currentTile.row,
        col: nextTile.col - currentTile.col,
      };
      this.lastDirection = direction;

      // Move to next tile center instantly
      const nextPos = tileToPixelCentered(nextTile.row, nextTile.col);
      this.sprite.setPosition(
        nextPos.x + this.mapOffset.x,
        nextPos.y + this.mapOffset.y
      );
    }
  }

  /**
   * Get current tile position
   */
  getTilePosition(): TilePosition {
    // Convert from screen space to map space before getting tile position
    return pixelToTile(
      this.sprite.x - this.mapOffset.x,
      this.sprite.y - this.mapOffset.y
    );
  }

  /**
   * Get pixel position
   */
  getPosition() {
    return { x: this.sprite.x, y: this.sprite.y };
  }

  /**
   * Handle being eaten by Pacman
   */
  getEaten(): void {
    this.setState(GhostState.EATEN);
  }

  /**
   * Check if ghost can be eaten
   */
  canBeEaten(): boolean {
    return this.state === GhostState.FRIGHTENED;
  }

  /**
   * Check if ghost is dangerous to Pacman
   */
  isDangerous(): boolean {
    return this.state === GhostState.CHASE || this.state === GhostState.SCATTER;
  }

  reset(tilePosition?: TilePosition): void {
    if (tilePosition) {
      this.position = tilePosition;
    }
    const pos = tileToPixelCentered(this.position.row, this.position.col);
    this.sprite.setPosition(pos.x + this.mapOffset.x, pos.y + this.mapOffset.y);
    this.sprite.setAlpha(1);
    this.setState(GhostState.SCATTER);
  }

  /**
   * Clean up
   */
  destroy(): void {
    if (this.stateTimer) {
      this.stateTimer.destroy();
    }
    this.sprite.destroy();
  }
}
