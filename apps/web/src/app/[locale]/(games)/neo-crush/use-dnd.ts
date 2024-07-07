// use-dnd.ts
import { BOARD_SIZE, Fruit } from './types';
import { checkForMatches } from './utils';
import { useCallback, useRef } from 'react';

const SWIPE_THRESHOLD = 0; // Adjust based on your grid size

export const useDragAndDrop = (
  fruits: Fruit[],
  setFruits: React.Dispatch<React.SetStateAction<Fruit[]>>,
  squareBeingDragged: HTMLDivElement | null,
  squareBeingReplaced: HTMLDivElement | null,
  setSquareBeingDragged: React.Dispatch<
    React.SetStateAction<HTMLDivElement | null>
  >,
  setSquareBeingReplaced: React.Dispatch<
    React.SetStateAction<HTMLDivElement | null>
  >,
  handleSpecialFruits: (
    draggedId: number,
    replacedId: number,
    fruits: Fruit[]
  ) => Fruit[]
) => {
  const touchStartPosition = useRef<{ x: number; y: number } | null>(null);
  const isSwiping = useRef(false);

  const dragStart = (e: React.DragEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    setSquareBeingDragged(target);
    e.dataTransfer.effectAllowed = 'move';
  };

  const dragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const dragLeave = (_: React.DragEvent<HTMLDivElement>) => {
    // No action needed
  };

  const dragDrop = (e: React.DragEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    setSquareBeingReplaced(target);
  };

  const swapFruits = useCallback(
    (draggedId: number, replacedId: number) => {
      let newFruits = [...fruits];
      const draggedFruit = newFruits[draggedId];
      const replacedFruit = newFruits[replacedId];

      newFruits[replacedId] = draggedFruit;
      newFruits[draggedId] = replacedFruit;

      newFruits = handleSpecialFruits(draggedId, replacedId, newFruits);

      const isAMatch = checkForMatches(newFruits, setFruits);
      if (!isAMatch) {
        newFruits[draggedId] = draggedFruit;
        newFruits[replacedId] = replacedFruit;
      }

      setFruits(newFruits);
    },
    [fruits, setFruits, handleSpecialFruits]
  );

  const dragEnd = useCallback(
    (
      e:
        | React.DragEvent<HTMLDivElement>
        | React.TouchEvent<HTMLDivElement>
        | null,
      defaultTarget?: HTMLDivElement
    ) => {
      const target = defaultTarget || (e?.target as HTMLDivElement);
      target.style.opacity = '1';

      if (!squareBeingDragged || !squareBeingReplaced) {
        setSquareBeingDragged(null);
        setSquareBeingReplaced(null);
        return;
      }

      const squareBeingDraggedId = parseInt(
        squareBeingDragged.getAttribute('data-id') || '0'
      );
      const squareBeingReplacedId = parseInt(
        squareBeingReplaced.getAttribute('data-id') || '0'
      );

      const validMoves = [
        squareBeingDraggedId - 1,
        squareBeingDraggedId - BOARD_SIZE,
        squareBeingDraggedId + 1,
        squareBeingDraggedId + BOARD_SIZE,
      ];

      const validMove = validMoves.includes(squareBeingReplacedId);

      if (validMove) {
        swapFruits(squareBeingDraggedId, squareBeingReplacedId);
      }

      setSquareBeingDragged(null);
      setSquareBeingReplaced(null);
    },
    [squareBeingDragged, squareBeingReplaced, swapFruits]
  );

  const touchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    const touch = e.touches[0];
    if (!touch) return;
    touchStartPosition.current = { x: touch.clientX, y: touch.clientY };
    setSquareBeingDragged(e.target as HTMLDivElement);
    isSwiping.current = false;
  };

  const touchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!touchStartPosition.current || !squareBeingDragged) return;

    const touch = e.touches[0];
    if (!touch) return;

    const diffX = touch.clientX - touchStartPosition.current.x;
    const diffY = touch.clientY - touchStartPosition.current.y;

    if (
      Math.abs(diffX) > SWIPE_THRESHOLD ||
      Math.abs(diffY) > SWIPE_THRESHOLD
    ) {
      isSwiping.current = true;
      const currentId = parseInt(
        squareBeingDragged.getAttribute('data-id') || '0'
      );

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
      }
    }
  };

  const touchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (squareBeingDragged && squareBeingReplaced) {
      dragEnd(e);
    }
    touchStartPosition.current = null;
    setSquareBeingDragged(null);
    setSquareBeingReplaced(null);
  };

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    console.log('Button clicked');
    console.log('squareBeingDragged: ', squareBeingDragged);
    console.log('squareBeingReplaced: ', squareBeingReplaced);

    const target = e.target as HTMLDivElement;

    if (!squareBeingDragged) {
      console.log('Setting squareBeingDragged');
      setSquareBeingDragged(target);
    } 
    if (squareBeingDragged && !squareBeingReplaced) {
      console.log('Setting squareBeingReplaced');
      if (!squareBeingReplaced) {
        setSquareBeingReplaced(target);
        dragEnd(e as React.DragEvent<HTMLDivElement>);
      } else {
        // console.log('Resetting');
        setSquareBeingDragged(null);
        setSquareBeingReplaced(null);
      }
    }
  };

  return {
    dragStart,
    dragOver,
    dragLeave,
    dragDrop,
    dragEnd,
    touchStart,
    touchMove,
    touchEnd,
    handleClick,
    isSwiping,
  };
};
