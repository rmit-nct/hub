import FruitPlaceholder from './fruit-placeholder';
import { BOARD_SIZE, Fruits } from './types';
import { useDragAndDrop } from './use-dnd';
import React, { useRef, useState } from 'react';

interface FruitGridProps {
  fruits: Fruits;
  setFruits: React.Dispatch<React.SetStateAction<Fruits>>;
  setScore: React.Dispatch<React.SetStateAction<number>>;
  handleSpecialFruits: (
    draggedId: number,
    replacedId: number,
    fruits: Fruits
  ) => Fruits;
  decrementTurns: () => void;
  disabled?: boolean;
}

export const FruitGrid: React.FC<FruitGridProps> = ({
  fruits,
  setFruits,
  setScore,
  handleSpecialFruits,
  decrementTurns,
  disabled = false,
}) => {
  const [squareBeingDragged, setSquareBeingDragged] =
    useState<HTMLDivElement | null>(null);
  const [squareBeingReplaced, setSquareBeingReplaced] =
    useState<HTMLDivElement | null>(null);
  const touchStartPosition = useRef<{ x: number; y: number } | null>(null);

  const {
    dragStart,
    dragOver,
    dragLeave,
    dragDrop,
    dragEnd,
    touchStart,
    touchEnd,
  } = useDragAndDrop(
    fruits,
    setFruits,
    setScore,
    squareBeingDragged,
    squareBeingReplaced,
    setSquareBeingDragged,
    setSquareBeingReplaced,
    handleSpecialFruits,
    decrementTurns,
    disabled
  );

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (disabled) return;

    const touch = e.touches[0];
    if (!touch) return;
    touchStartPosition.current = { x: touch.clientX, y: touch.clientY };
    touchStart(e);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (disabled) return;
    if (!touchStartPosition.current) return;

    const touch = e.touches[0];
    if (!touch) return;

    const diffX = touch.clientX - touchStartPosition.current.x;
    const diffY = touch.clientY - touchStartPosition.current.y;

    if (Math.abs(diffX) > 20 || Math.abs(diffY) > 20) {
      const target = e.target as HTMLDivElement;
      const currentId = parseInt(target.getAttribute('data-id') || '0');

      let newId;
      if (Math.abs(diffX) > Math.abs(diffY)) {
        // Horizontal swipe
        newId = currentId + (diffX > 0 ? 1 : -1);
      } else {
        // Vertical swipe
        newId = currentId + (diffY > 0 ? BOARD_SIZE : -BOARD_SIZE);
      }

      const newTarget = document.querySelector(
        `[data-id="${newId}"]`
      ) as HTMLDivElement;
      if (newTarget) {
        setSquareBeingReplaced(newTarget);
        dragDrop({
          target: newTarget,
        } as unknown as React.DragEvent<HTMLDivElement>);
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (disabled) return;
    touchEnd(e);
  };

  return (
    <>
      <style jsx>{`
        @keyframes pulse {
          0% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
          100% {
            transform: scale(1);
          }
        }
        @keyframes special-pulse {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.2);
            opacity: 0.7;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
      <div className="mx-auto grid w-fit grid-cols-8 gap-2 lg:gap-3">
        {fruits.map((fruit, index) => (
          <FruitPlaceholder
            key={index}
            data-id={index}
            fruit={fruit}
            data-color={fruit?.color}
            data-type={fruit?.type}
            draggable={true}
            onDragStart={dragStart}
            onDragOver={dragOver}
            onDragLeave={dragLeave}
            onDrop={dragDrop}
            onDragEnd={dragEnd}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          />
        ))}
      </div>
    </>
  );
};
